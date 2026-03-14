import { cache } from 'react'
import { prisma, selectSwapEvents as select } from '@repo/database'
import type { Prisma } from '@repo/database'

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

	return swapEvents
})
