import { program } from '@/app/utils/setup'
import { type EventData, fetchBondingCurveState, getBondingCurveState } from '@repo/magicmint'
import { sendRaydiumAlertoDiscord } from '@/app/webhook/discord'
import { getTokenWithRelations } from '@/app/data/get_token'
import { PublicKey } from '@solana/web3.js'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'

import 'server-only'

async function updateBondingCurveSupply(mint: PublicKey) {
	const pda = getBondingCurveState({ program, mint })

	const { progress, marketCap, connectorWeight, ...rest } = await fetchBondingCurveState({ program, mint })

	const totalSupply = BigInt(rest.totalSupply.toString())

	const data = Prisma.validator<Prisma.BondingCurveUpdateInput>()({
		totalSupply,
	})

	const update = await prisma.bondingCurve.update({
		where: { id: pda.toBase58() },
		data,
	})

	console.log('🔁 Synced bonding curve:', update)
}

export async function processRaydiumEvents(raydiumEvents: EventData<'raydiumEvent'>[]) {
	for await (const event of raydiumEvents) {
		try {
			await updateBondingCurveSupply(event.data.mint)
			const token = await getTokenWithRelations(event.data.mint.toBase58())
			await sendRaydiumAlertoDiscord(event, token)
		} catch (err) {
			console.error('processRaydiumEvents error', {
				signature: event.signature,
				mint: event.data.mint?.toBase58(),
				err,
			})
		}
	}
}
