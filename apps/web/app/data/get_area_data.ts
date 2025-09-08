import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import 'server-only'

export async function getAreaData(mint: string) {
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

	const data = swapEvents.map(e => ({
		time: new Decimal(e.time.toString()).mul(1).toNumber(),
		value: e.price.toNumber(),
	}))

	return data
}
