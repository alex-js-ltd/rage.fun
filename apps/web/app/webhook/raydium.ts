import { program } from '@/app/utils/setup'
import { type EventData, fetchBondingCurveState, getBondingCurveState } from '@repo/rage'

import { getTokenWithRelations } from '@/app/data/get_token'
import { PublicKey } from '@solana/web3.js'
import { prisma } from '@/app/utils/db'
import { Prisma, SwapType, SwapEvent, $Enums } from '@prisma/client'
import 'server-only'

async function updateBondingCurveSupply(mint: PublicKey) {
	const pda = getBondingCurveState({ program, mint })

	const { ...rest } = await fetchBondingCurveState({ program, mint })

	const currentSupply = BigInt(rest.currentSupply.toString())

	const status = rest.status.funding
		? $Enums.Status.Funding
		: rest.status.complete
			? $Enums.Status.Complete
			: $Enums.Status.Migrated

	const data = Prisma.validator<Prisma.BondingCurveUpdateInput>()({
		currentSupply,
		status,
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
		} catch (err) {
			console.error('processRaydiumEvents error', {
				signature: event.signature,
				mint: event.data.mint?.toBase58(),
				err,
			})
		}
	}
}
