import { PublicKey } from '@solana/web3.js'
import { type EventData, getBondingCurveState, fetchBondingCurveState } from '@repo/rage'
import { program } from '@/app/utils/setup'
import { prisma } from '@/app/utils/db'
import { Prisma, $Enums } from '@prisma/client'
import { getServerEnv } from '@/app/utils/env'
import { getTokenWithRelations } from '@/app/data/get_token'
import { sendUpdateAlertToAbly } from '@/app/webhook/ably'

import { revalidateTag } from 'next/cache'
import * as Ably from 'ably'
import 'server-only'

const { ABLY_API_KEY } = getServerEnv()

export async function createBondingCurve(mint: PublicKey) {
	const tokenId = mint.toBase58()
	const pda = getBondingCurveState({ program, mint })
	const id = pda.toBase58()

	const { connectorWeight, decimals, ...rest } = await fetchBondingCurveState({
		program,
		mint,
	})

	const virtualSupply = BigInt(rest.virtualSupply.toString())
	const currentSupply = BigInt(rest.currentSupply.toString())
	const targetSupply = BigInt(rest.targetSupply.toString())

	const virtualReserve = BigInt(rest.virtualReserve.toString())
	const currentReserve = BigInt(rest.currentReserve.toString())
	const targetReserve = BigInt(rest.targetReserve.toString())

	const openTime = BigInt(rest.openTime.toString())

	const tradingFees = BigInt('0')

	const status = $Enums.Status.Funding

	const create = Prisma.validator<Prisma.BondingCurveCreateArgs>()({
		data: {
			id,

			connectorWeight,
			decimals,

			virtualSupply,
			currentSupply,
			targetSupply,

			virtualReserve,
			currentReserve,
			targetReserve,

			openTime,
			tradingFees,

			status,

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

			await sendUpdateAlertToAbly(channel, token, 'Create')

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
