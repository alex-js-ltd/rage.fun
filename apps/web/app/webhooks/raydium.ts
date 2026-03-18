import { program } from '@/app/utils/setup'
import { type EventData, fetchBondingCurveState, getBondingCurveState } from '@repo/rage'

import { PublicKey } from '@solana/web3.js'
import { prisma, $Enums } from '@repo/database'
import type { Prisma } from '@repo/database'
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

	const data = {
		currentSupply,
		status,
	} satisfies Prisma.BondingCurveUpdateInput

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
		} catch (err) {
			console.error('processRaydiumEvents error', {
				signature: event.signature,
				mint: event.data.mint?.toBase58(),
				err,
			})
		}
	}
}
