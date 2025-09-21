import { prisma } from '@/app/utils/db'
import { Prisma, SwapType, SwapEvent, $Enums } from '@prisma/client'

export async function getRandomToken() {
	const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

	const where: Prisma.TokenWhereInput = {
		createdAt: { gte: since },
		// optional: only launched tokens
		// bondingCurve: { isNot: null },
	}

	const count = await prisma.token.count({ where })
	if (count === 0) return null

	const skip = Math.floor(Math.random() * count)

	const [token] = await prisma.token.findMany({
		where,
		orderBy: { id: 'asc' }, // ensure deterministic order when using skip
		skip,
		take: 1,
		// select: { id: true, ... } // add fields you need
	})

	return token ?? null
}
