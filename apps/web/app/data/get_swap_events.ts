import { cache } from 'react'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import 'server-only'

export const getSwapEvents = cache(async (mint: string) => {
	const query = Prisma.validator<Prisma.SwapEventFindManyArgs>()({
		where: {
			tokenId: mint,

			lamports: {
				not: BigInt(0),
			},
		},

		orderBy: {
			time: 'asc',
		},
	})

	const swapEvents = await prisma.swapEvent.findMany(query)

	return swapEvents
})
