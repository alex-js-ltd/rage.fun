import { cache } from 'react'
import { prisma, selectSwapEvents as select } from '@repo/database'
import type { SwapEventRow } from '@repo/database'
import Decimal from 'decimal.js'
import 'server-only'

export const getSwapEvents = cache(async (mint: string) => {
	const swapEvents = await prisma.swapEvent.findMany({
		where: {
			tokenId: mint,

			lamports: {
				not: BigInt(0),
			},
		},

		select,

		orderBy: {
			time: 'asc',
		},
	})

	return swapEvents.map(toSwapEvent)
})

export function toSwapEvent(data: SwapEventRow) {
	return {
		id: data.id,
		signer: data.id,
		time: new Decimal(data.time.toString()).toNumber(),
		price: data.price.toNumber(),
		tokenAmount: data.tokenAmount.toString(),
		swapType: data.swapType,
		lamports: data.lamports.toString(),
		rentAmount: data.rentAmount.toString(),
		tokenId: data.tokenId,
	}
}

export type SwapEvent = ReturnType<typeof toSwapEvent>
