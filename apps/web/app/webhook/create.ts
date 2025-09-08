import { PublicKey } from '@solana/web3.js'
import { type EventData, getBondingCurveState, fetchBondingCurveState } from '@repo/magicmint'
import { program } from '@/app/utils/setup'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { getServerEnv } from '@/app/utils/env'
import { getTokenWithRelations } from '@/app/data/get_token'
import { sendUpdateAlertToAbly } from '@/app/webhook/ably'
import { sendCreateAlertToDiscord } from '@/app/webhook/discord'
import { revalidateTag } from 'next/cache'
import * as Ably from 'ably'
import 'server-only'

const { ABLY_API_KEY } = getServerEnv()

export async function createBondingCurve(mint: PublicKey) {
	const tokenId = mint.toBase58()
	const pda = getBondingCurveState({ program, mint })
	const id = pda.toBase58()

	const { progress, decimals, creator, connectorWeight, marketCap, ...rest } = await fetchBondingCurveState({
		program,
		mint,
	})

	const totalSupply = BigInt(rest.totalSupply.toString())

	const reserveBalance = BigInt(rest.reserveBalance.toString())

	const startTime = BigInt(rest.openTime.toString())

	const targetReserve = BigInt(rest.targetReserve.toString())

	const volume = BigInt('0')

	const tradingFees = BigInt('0')

	const create = Prisma.validator<Prisma.BondingCurveCreateArgs>()({
		data: {
			id,
			progress,
			decimals,
			totalSupply,
			reserveBalance,
			startTime,
			marketCap,
			connectorWeight,
			targetReserve,
			volume,
			tradingFees,
			token: { connect: { id: tokenId } },
		},
	})

	const data = await prisma.bondingCurve.create(create)

	return data
}

export async function processCreateEvents(createEvents: EventData<'createEvent'>[]) {
	const client = new Ably.Rest(ABLY_API_KEY)
	const channel = client.channels.get('updateEvent')

	for await (const event of createEvents) {
		try {
			await createBondingCurve(event.data.mint)

			const token = await getTokenWithRelations(event.data.mint.toBase58())

			await sendUpdateAlertToAbly(channel, token, 'CREATE')

			await sendCreateAlertToDiscord(event, token)

			revalidateTag(token.id)
		} catch (err) {
			console.error('processCreateEvents error', {
				signature: event.signature,
				mint: event.data.mint?.toBase58?.(),
				err,
			})
		}
	}
}
