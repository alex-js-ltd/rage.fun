import { prisma } from '@/app/utils/db'
import { Prisma, SwapType, SwapEvent, $Enums, BondingCurve } from '@prisma/client'

import { program } from '@/app/utils/setup'
import { Keypair, PublicKey } from '@solana/web3.js'
import { getEnv } from '@/app/utils/env'
import {
	type Rage,
	type GetProxyInitIxsParams,
	type EventData,
	getProxyInitIxs,
	buildTransaction,
	getAccountsToAirdrop,
	getBondingCurveState,
	fetchBondingCurveState,
	sendAndConfirm,
} from '@repo/rage'
import { connection } from '@/app/utils/setup'

import { Program } from '@coral-xyz/anchor'
import { revalidateTag, revalidatePath } from 'next/cache'

import { getServerEnv } from '@/app/utils/env'
import * as Ably from 'ably'
import { SwapEventSchema } from '@/app/utils/schemas'
import { getTokenWithRelations } from '@/app/data/get_token'
import { getSigner } from '@/app/utils/misc'
import { getSingleTransaction } from '@/app/data/get_single_transaction'

// ALERTS

import {
	sendSwapAlertToAbly,
	sendTopHoldersAlertToAbly,
	sendUpdateAlertToAbly,
	sendTransactionAlertToAbly,
} from '@/app/webhook/ably'
import { getTopHolders } from '@/app/data/get_top_holders'
import { getVolume } from '@/app/data/get_volume'
import { calculatePrice, calculateMarketCap } from './create'
import 'server-only'
import { getTransactionCount } from '../data/get_transaction_count'

const { ABLY_API_KEY, PROXY_PRIVATE_KEY } = getServerEnv()

const { CLUSTER } = getEnv()

export async function updateBondingCurveState(address: string) {
	const mint = new PublicKey(address)
	const pda = getBondingCurveState({ program, mint })

	const { ...rest } = await fetchBondingCurveState({ program, mint })

	const currentSupply = BigInt(rest.currentSupply.toString())
	const currentReserve = BigInt(rest.currentReserve.toString())
	const tradingFees = BigInt(rest?.tradingFees?.toString())

	const status = rest.status.funding
		? $Enums.Status.Funding
		: rest.status.complete
			? $Enums.Status.Complete
			: $Enums.Status.Migrated

	const data = Prisma.validator<Prisma.BondingCurveUpdateInput>()({
		currentSupply,
		currentReserve,
		tradingFees,
		status,
	})

	const update = await prisma.bondingCurve.update({
		where: { id: pda.toBase58() },
		data,
	})

	console.log('🔁 Synced bonding curve:', update)

	return update
}

export async function updateMarketData(bondingCurve: BondingCurve) {
	const tokenId = bondingCurve.tokenId

	const price = calculatePrice(bondingCurve)
	const marketCap = calculateMarketCap(price, bondingCurve)
	const liquidity = bondingCurve.currentReserve

	const volume = await getVolume(tokenId)

	const { buys, sells } = await getTransactionCount(tokenId)

	const buyCount = buys
	const sellCount = sells

	const data = Prisma.validator<Prisma.MarketDataUpdateInput>()({
		price,
		marketCap,

		liquidity,
		volume,

		buyCount,
		sellCount,
	})

	const update = await prisma.marketData.update({
		where: { tokenId },
		data,
	})

	return update
}

export async function upsertSwapEvent(eventData: EventData<'swapEvent'>): Promise<SwapEvent> {
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

	const create = Prisma.validator<Prisma.SwapEventCreateInput>()({
		id,
		signer,
		time,
		price,
		tokenAmount,
		lamports,
		rentAmount,
		swapType,
		token: { connect: { id: tokenId } },
	})

	const upsert = Prisma.validator<Prisma.SwapEventUpsertArgs>()({
		where: { id: signature }, // this is your unique identifier
		create,
		update: {}, // Do nothing if it already exists
	})

	const swapEvent = await prisma.swapEvent.upsert(upsert)

	return swapEvent
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
	const updateChannel = client.channels.get('updateEvent')
	const transactionChannel = client.channels.get('transactionEvent')
	const holdersChannel = client.channels.get('holdersEvent')
	const payer = getSigner(PROXY_PRIVATE_KEY)

	for await (const event of swapEvents) {
		try {
			const swapEvent = await upsertSwapEvent(event)
			const curve = await updateBondingCurveState(event.data.mint.toBase58())
			await updateMarketData(curve)

			const parsed = SwapEventSchema.safeParse(swapEvent)

			if (!parsed.success) {
				console.warn(`❗️SwapEvent failed Zod validation for ${event.signature}`)
				continue
			}

			const swapAlert = parsed.data

			revalidateTag(swapAlert.tokenId)

			revalidatePath(`@token/(.)token/${swapAlert.tokenId}`)
			revalidatePath(`/token/${swapAlert.tokenId}`)

			await sendSwapAlertToAbly(swapChannel, swapAlert)

			const transaction = await getSingleTransaction(swapAlert.id)

			await sendTransactionAlertToAbly(transactionChannel, transaction)

			const token = await getTokenWithRelations(swapAlert.tokenId)

			await sendUpdateAlertToAbly(updateChannel, token, parsed.data.swapType)

			const topHolders = await getTopHolders(swapAlert.tokenId)

			await sendTopHoldersAlertToAbly(holdersChannel, topHolders, token)

			if (curve.status === 'Complete') {
				await deployToRaydium({ program, mint: event.data.mint, payer })
			}
		} catch (err) {
			console.error(`🔥 Error processing swap event for ${event.data.mint.toBase58()}:`, err)
		}
	}
}
