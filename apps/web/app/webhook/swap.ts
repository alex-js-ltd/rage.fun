import { prisma } from '@/app/utils/db'
import { Prisma, SwapType, SwapEvent } from '@prisma/client'

import { program } from '@/app/utils/setup'
import { Keypair, PublicKey } from '@solana/web3.js'
import { getEnv } from '@/app/utils/env'
import {
	type Magicmint,
	type GetProxyInitIxsParams,
	type EventData,
	getProxyInitIxs,
	buildTransaction,
	getUnlockAirdropIxs,
	getAccountsToAirdrop,
	getBondingCurveState,
	fetchBondingCurveState,
	sendAndConfirm,
	getSyncBondingCurveIx,
} from '@repo/magicmint'
import { connection } from '@/app/utils/setup'
import { getRandomUsers } from '@/app/data/get_random_users'
import { Program } from '@coral-xyz/anchor'

import { getMint, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { TokenWithRelationsType } from '../utils/schemas'
import { BN } from '@coral-xyz/anchor'

import { revalidateTag, revalidatePath } from 'next/cache'

import { getServerEnv } from '@/app/utils/env'
import * as Ably from 'ably'
import { SwapEventSchema } from '@/app/utils/schemas'
import { getTokenWithRelations } from '@/app/data/get_token'
import { getSigner } from '@/app/utils/misc'
import { getSingleTransaction } from '@/app/data/get_single_transaction'

// ALERTS
import { sendSwapAlertToDiscord } from '@/app/webhook/discord'
import { sendSwapAlertToTelegram } from '@/app/webhook/telegram'
import {
	sendSwapAlertToAbly,
	sendTopHoldersAlertToAbly,
	sendUpdateAlertToAbly,
	sendTransactionAlertToAbly,
} from '@/app/webhook/ably'
import { getTopHolders } from '@/app/data/get_top_holders'
import { getOustandingAirdrops } from '@/app/data/get_outstanding_airdrops'

import 'server-only'

const { ABLY_API_KEY, PROXY_PRIVATE_KEY } = getServerEnv()

const { CLUSTER } = getEnv()

export async function updateBondingCurveState(address: string) {
	const mint = new PublicKey(address)
	const pda = getBondingCurveState({ program, mint })

	const { progress, marketCap, connectorWeight, ...rest } = await fetchBondingCurveState({ program, mint })

	const totalSupply = BigInt(rest.totalSupply.toString())

	const reserveBalance = BigInt(rest.reserveBalance.toString())

	const startTime = BigInt(rest.openTime.toString())

	const tradingFees = rest?.tradingFees ? BigInt(rest?.tradingFees?.toString()) : BigInt(0)

	const data = Prisma.validator<Prisma.BondingCurveUpdateInput>()({
		progress,
		totalSupply,
		reserveBalance,
		marketCap,
		startTime,
		connectorWeight,
		tradingFees,
	})

	const update = await prisma.bondingCurve.update({
		where: { id: pda.toBase58() },
		data,
	})

	console.log('🔁 Synced bonding curve:', update)

	return progress
}

export async function upsertSwapEvent(eventData: EventData<'swapEvent'>): Promise<SwapEvent> {
	const { data, signature } = eventData

	const id = signature
	const signer = data.signer.toBase58()
	const time = BigInt(data.time.toString())
	const price = data.price
	const amount = BigInt(data.tokenAmount.toString())
	const lamports = BigInt(data.lamports.toString())
	const rentAmount = BigInt(data.rentAmount.toString())
	const tokenId = data.mint.toBase58()

	const buy = data.swapType.buy ? true : false

	const swapType = buy ? SwapType.BUY : SwapType.SELL

	const create = Prisma.validator<Prisma.SwapEventCreateInput>()({
		id,
		signer,
		time,
		price,
		amount,
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

export async function updateVolume(mint: string) {
	const agg = await prisma.swapEvent.aggregate({
		where: { tokenId: mint },
		_sum: { lamports: true },
	})

	const volume = agg._sum.lamports ?? BigInt(0)

	const data = Prisma.validator<Prisma.BondingCurveUpdateInput>()({
		volume,
	})

	const update = await prisma.bondingCurve.update({
		where: { tokenId: mint },
		data,
	})

	console.log('🔁 volume updated:', update)
}

export async function deployToRaydium({
	program,
	mint,
	payer,
}: {
	program: Program<Magicmint>
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

export async function unlockAirdrop({
	program,
	mint,
	payer,
}: {
	program: Program<Magicmint>
	payer: Keypair
	mint: PublicKey
}) {
	const accounts = await getRandomUsers(mint.toBase58())

	const users = getAccountsToAirdrop({ accounts, mint })

	const ixs = await getUnlockAirdropIxs({
		program,
		mint,
		payer: payer.publicKey,
		users,
	})

	const tx = await buildTransaction({
		connection,
		payer: payer.publicKey,
		instructions: [...ixs],
		signers: [],
	})

	tx.sign([payer])

	const sig = await sendAndConfirm({ connection, tx })

	console.log(`🔗 Transaction sig: ${sig} for airdrops`)
}

export async function syncBondingCurve({
	program,
	token,
	payer,
}: {
	program: Program<Magicmint>
	payer: Keypair
	token: TokenWithRelationsType
}) {
	const { id } = token
	const { totalSupply } = token.bondingCurve

	const mint = new PublicKey(id)

	const offChain = new BN(totalSupply)

	const { supply } = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID)

	const onChain = new BN(supply.toString())

	if (onChain.eq(offChain)) {
		console.log('bonding curve already in sync 🫡')
		return
	}

	const ix = await getSyncBondingCurveIx({
		program,
		mint,
		payer: payer.publicKey,
	})

	const tx = await buildTransaction({
		connection,
		payer: payer.publicKey,
		instructions: [ix],
		signers: [],
	})

	tx.sign([payer])

	const sig = await sendAndConfirm({ connection, tx })

	console.log(`🔗 Transaction sig: ${sig} for sync bonding curve`)
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
			const progress = await updateBondingCurveState(event.data.mint.toBase58())
			await updateVolume(event.data.mint.toBase58())

			const parsed = SwapEventSchema.safeParse(swapEvent)

			if (!parsed.success) {
				console.warn(`❗️SwapEvent failed Zod validation for ${event.signature}`)
				continue
			}

			const swapAlert = parsed.data

			revalidateTag(`price-deltas-${swapAlert.tokenId}`)
			revalidateTag(swapAlert.tokenId)
			revalidatePath(`/token/${swapAlert.tokenId}`)

			await sendSwapAlertToAbly(swapChannel, swapAlert)

			const token = await getTokenWithRelations(swapAlert.tokenId)

			await sendUpdateAlertToAbly(updateChannel, token, parsed.data.swapType)

			const transaction = await getSingleTransaction(swapAlert.id, token.bondingCurve.decimals)

			await sendTransactionAlertToAbly(transactionChannel, transaction)

			const topHolders = await getTopHolders(swapAlert.tokenId)

			await sendTopHoldersAlertToAbly(holdersChannel, topHolders, token)

			await sendSwapAlertToDiscord(swapAlert, token, topHolders)
			await sendSwapAlertToTelegram(swapAlert, token, topHolders)

			await syncBondingCurve({ program, payer, token })
			// Unlock pending airdrops and deploy to Raydium if progress is complete.
			const airdrops = await getOustandingAirdrops(swapAlert.tokenId)

			console.log(`🔔 Outstanding airdrops for token ${swapAlert.tokenId}: ${airdrops}`)

			for (let i = 0; i < airdrops; i++) {
				await unlockAirdrop({ program, mint: event.data.mint, payer })
			}

			if (progress >= 100.0) {
				await deployToRaydium({ program, mint: event.data.mint, payer })
			}
		} catch (err) {
			console.error(`🔥 Error processing swap event for ${event.data.mint.toBase58()}:`, err)
		}
	}
}
