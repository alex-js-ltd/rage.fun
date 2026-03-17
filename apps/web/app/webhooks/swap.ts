import { prisma } from '@repo/database'
import { Prisma, SwapType, $Enums } from '@repo/database'

import { program } from '@/app/utils/setup'
import { Keypair, PublicKey } from '@solana/web3.js'
import { getEnv } from '@/app/utils/env'
import {
	type Rage,
	type GetProxyInitIxsParams,
	type EventData,
	getProxyInitIxs,
	buildTransaction,
	getBondingCurveState,
	fetchBondingCurveState,
	sendAndConfirm,
	BondingCurveState,
} from '@repo/rage'
import { connection } from '@/app/utils/setup'

import { Program } from '@coral-xyz/anchor'
import { revalidatePath } from 'next/cache'

import { getServerEnv } from '@/app/utils/env'

import { toSwapEvent } from '@/app/data/get_swap_events'
import type { SwapEvent } from '@/app/data/get_swap_events'

import { getSigner } from '@/app/utils/misc'
import { getTransaction } from '@/app/data/get_transaction_data'
import { getTopHolders } from '@/app/data/get_top_holders'
import { getVolume } from '@/app/data/get_volume'
import { calculatePrice, calculateMarketCap } from './create'
import { getTransactionCount } from '@/app/data/get_transaction_count'
import { getSolPrice } from '@/app/data/get_sol_price'
import { upsertUserPnL } from '@/app/webhook/user'

import * as Ably from 'ably'
import * as AblyEvents from '@/app/webhooks/ably'
import * as DiscordAlerts from '@/app/webhooks/discord'
// import * as TelegramAlerts from '@/app/webhooks/telegram'

import { getTokenCard } from '@/app/data/get_token_feed'

import { type TokenAlert, getTokenAlert } from '@/app/data/get_token_alert'
import { getSwapConfig } from '@/app/data/get_swap_config'
import { type TopHolder } from '@/app/data/get_top_holders'

import { toPnl } from '@/app/data/get_token_pnl'

import 'server-only'

const { ABLY_API_KEY, PROXY_PRIVATE_KEY } = getServerEnv()

const { CLUSTER } = getEnv()

export async function updateBondingCurveState(state: BondingCurveState) {
	const { mint, ...rest } = state

	const pda = getBondingCurveState({ program, mint })

	const currentSupply = BigInt(rest.currentSupply.toString())
	const currentReserve = BigInt(rest.currentReserve.toString())
	const tradingFees = BigInt(rest?.tradingFees?.toString())

	const status = rest.status.funding
		? $Enums.Status.Funding
		: rest.status.complete
			? $Enums.Status.Complete
			: $Enums.Status.Migrated

	const data = {
		currentSupply,
		currentReserve,
		tradingFees,
		status,
	} satisfies Prisma.BondingCurveUpdateInput

	const update = await prisma.bondingCurve.update({
		where: { id: pda.toBase58() },
		data,
	})

	console.log('🔁 Synced bonding curve:', update)

	return update
}

export async function updateMarketData(state: BondingCurveState) {
	const { mint } = state

	const tokenId = mint.toBase58()

	const price = calculatePrice(state)
	const marketCap = calculateMarketCap(price, state)
	const liquidity = state.currentReserve.toNumber()

	const volume = await getVolume(tokenId)

	const { buys, sells } = await getTransactionCount(tokenId)

	const buyCount = buys
	const sellCount = sells

	const data = {
		price,
		marketCap,

		liquidity,
		volume,

		buyCount,
		sellCount,
	} satisfies Prisma.MarketDataUpdateInput

	const update = await prisma.marketData.update({
		where: { tokenId },
		data,
	})

	console.log('🔁 Synced market data:', update)

	return update
}

export async function upsertSwapEvent(eventData: EventData<'swapEvent'>) {
	const { data, signature } = eventData

	const id = signature
	const signer = data.signer.toBase58()
	const time = BigInt(data.time.toString())
	const price = data.price
	const tokenAmount = BigInt(data.tokenAmount.toString())
	const lamports = BigInt(data.lamports.toString())
	const rentAmount = BigInt(data.rentAmount.toString())
	const tokenId = data.mint.toBase58()

	const buy = data.swapType.buy ? true : false

	const swapType = buy ? SwapType.Buy : SwapType.Sell

	const create = {
		id,
		signer,
		time,
		price,
		tokenAmount,
		lamports,
		rentAmount,
		swapType,
		token: { connect: { id: tokenId } },
	} satisfies Prisma.SwapEventCreateInput

	const upsert = {
		where: { id: signature }, // this is your unique identifier
		create,
		update: {}, // Do nothing if it already exists
	} satisfies Prisma.SwapEventUpsertArgs

	const res = await prisma.swapEvent.upsert(upsert)

	return toSwapEvent(res)
}

export async function deployToRaydium({
	program,
	mint,
	payer,
}: {
	program: Program<Rage>
	payer: Keypair
	mint: PublicKey
}) {
	const ixs = await getProxyInitIxs({
		program,
		cluster: CLUSTER as GetProxyInitIxsParams['cluster'],
		mint,
		signer: payer.publicKey,
	})

	const tx = await buildTransaction({
		connection,
		payer: payer.publicKey,
		instructions: [...ixs],
		signers: [],
	})

	tx.sign([payer])

	const sig = await sendAndConfirm({ connection, tx })
	console.log(`🔗 Transaction sig: ${sig} for raydium`)
}

export async function processSwapEvents(swapEvents: EventData<'swapEvent'>[]) {
	const client = new Ably.Rest(ABLY_API_KEY)

	const swapChannel = client.channels.get('swapEvent')
	const swapConfigChannel = client.channels.get('swapConfigEvent')
	const updateChannel = client.channels.get('updateEvent')
	const transactionChannel = client.channels.get('transactionEvent')
	const holdersChannel = client.channels.get('holdersEvent')
	const pnlChannel = client.channels.get('pnlEvent')
	const payer = getSigner(PROXY_PRIVATE_KEY)

	const socialAlerts: Array<{ swapEvent: SwapEventType; token: TokenAlert; topHolders: TopHolder[] }> = []

	for await (const event of swapEvents) {
		try {
			const mint = event.data.mint

			const [swapEvent, state] = await Promise.all([
				upsertSwapEvent(event),
				fetchBondingCurveState({
					program,
					mint,
				}),
			])

			// update db
			const [curve, market] = await Promise.all([updateBondingCurveState(state), updateMarketData(state)])

			const { tokenId, signer } = swapEvent

			revalidatePath(`@token/(.)token/${tokenId}`)
			revalidatePath(`/token/${tokenId}`)

			const [transaction, token, swapConfig] = await Promise.all([
				getTransaction(swapEvent),
				getTokenCard(tokenId),
				getSwapConfig(tokenId),
			])

			await AblyEvents.publishSwapEvent(swapChannel, swapEvent)
			await AblyEvents.publishSwapConfigEvent(swapConfigChannel, swapConfig)
			await AblyEvents.publishTransactionEvent(transactionChannel, transaction)
			await AblyEvents.publishUpdateEvent(updateChannel, token, swapEvent.swapType)

			const topHolders = await getTopHolders(tokenId)

			await AblyEvents.publishTopHoldersEvent(holdersChannel, topHolders, token)

			const pnl = await upsertTokenPnL(tokenId, signer)

			const solPrice = await getSolPrice()

			await AblyEvents.publishPnLEvent(pnlChannel, { ...toPnl(pnl, solPrice) })

			if (curve.status === 'Complete') {
				await deployToRaydium({ program, mint: event.data.mint, payer })
			}

			const socialAlert: { swapEvent: SwapEvent; token: TokenAlert; topHolders: TopHolder[] } = {
				swapEvent,
				token: await getTokenAlert(tokenId),
				topHolders,
			}

			socialAlerts.push(socialAlert)
		} catch (err) {
			console.error(`🔥 Error processing swap event for ${event.data.mint.toBase58()}:`, err)
		}
	}

	const userIds = [...new Set(swapEvents.map(e => e.data.signer.toBase58()))]

	for (const userId of userIds) {
		try {
			await upsertUserPnL(userId)
		} catch (err) {
			console.error(`🔥 Failed to upsert PnL for user ${userId}:`, err instanceof Error ? err.message : err)
		}
	}

	for await (const alert of socialAlerts) {
		try {
			await DiscordAlerts.publishSwapEvent(alert.swapEvent, alert.token, alert.topHolders)
			await TelegramAlerts.publishSwapEvent(alert.swapEvent, alert.token, alert.topHolders)
		} catch (err) {
			console.error(`🔥 Error processing social alert for ${alert.swapEvent.tokenId}:`, err)
		}
	}
}

export async function upsertTokenPnL(tokenId: string, signer: string) {
	const { bought, sold, realizedPnl } = await computeTokenPnl(tokenId, signer)

	try {
		const row = await prisma.tokenPnl.upsert({
			where: {
				signer_tokenId: {
					signer,
					tokenId,
				},
			},
			create: {
				signer,
				tokenId,
				bought,
				sold,
				realizedPnl,
			},
			update: {
				bought,
				sold,
				realizedPnl,
			},
		})

		// 🧠 Format profit visually (add + sign if positive)
		const pnl = realizedPnl > BigInt('0') ? `+${realizedPnl}` : `${realizedPnl}`

		console.log(
			`💹 [PnL Updated] Token: ${tokenId}\n` +
				`👤 Signer: ${signer}\n` +
				`🟢 Bought: ${bought} lamports\n` +
				`🔴 Sold: ${sold} lamports\n` +
				`💰 Realized PnL: ${pnl} lamports\n` +
				`✅ Upsert successful\n`,
		)

		return row
	} catch (err) {
		console.error(`🔥 [PnL Upsert Error] tokenId=${tokenId}, signer=${signer}`, err)
		throw err
	}
}

export async function computeTokenPnl(tokenId: string, signer: string) {
	//
	// 1. Aggregate SOL in/out
	//
	const buyAgg = await prisma.swapEvent.aggregate({
		where: {
			tokenId,
			signer,
			swapType: 'Buy',
		},
		_sum: {
			lamports: true,
		},
	})

	const sellAgg = await prisma.swapEvent.aggregate({
		where: {
			tokenId,
			signer,
			swapType: 'Sell',
		},
		_sum: {
			lamports: true,
		},
	})

	const bought = buyAgg._sum.lamports ?? BigInt(0) // SOL spent
	const sold = sellAgg._sum.lamports ?? BigInt(0) // SOL received

	//
	// 2. Realized PnL = what they've already locked in
	//
	const realizedPnl = sold - bought // can be neg

	return {
		signer,
		tokenId,
		bought,
		sold,
		realizedPnl,
	}
}
