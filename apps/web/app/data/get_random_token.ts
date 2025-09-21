import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'

type Options = {
	hours?: number // recency window
	limit?: number // how many newest to consider
	requireTraded?: boolean // only tokens that have at least one swap
}

export async function getRandomToken({ hours = 24, limit = 200, requireTraded = false }: Options = {}) {
	const since = new Date(Date.now() - hours * 60 * 60 * 1000)

	const where: Prisma.TokenWhereInput = {
		createdAt: { gte: since },
		// only launched tokens? uncomment:
		// bondingCurve: { isNot: null },
		...(requireTraded ? { swapEvents: { some: {} } } : {}),
	}

	const tokens = await prisma.token.findMany({
		where,
		orderBy: { createdAt: 'desc' },
		take: limit,
		select: { id: true, createdAt: true }, // add fields you need
	})

	if (tokens.length === 0) return null
	const idx = Math.floor(Math.random() * tokens.length)
	return tokens[idx]
}
