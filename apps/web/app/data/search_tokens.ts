import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'

import 'server-only'

export async function searchTokens(symbol: string) {
	if (symbol === '') return []

	const query = Prisma.validator<Prisma.TokenFindManyArgs>()({
		where: {
			bondingCurve: { isNot: null },
			metadata: { symbol: { contains: symbol, mode: 'insensitive' } },
		},
		orderBy: {
			createdAt: 'asc',
		},
		select,
	})

	const data = await prisma.token.findMany(query)

	return data.map(toSearch)
}

const select = Prisma.validator<Prisma.TokenSelect>()({
	id: true,

	metadata: {
		select: {
			symbol: true,
			image: true,
			thumbhash: true,
		},
	},
})

type SearchPayload = Prisma.TokenGetPayload<{
	select: typeof select
}>

function getMetadata(metadata: NonNullable<SearchPayload['metadata']>) {
	return { ...metadata, thumbhash: Buffer.from(metadata.thumbhash).toString('base64') }
}

function toSearch(search: SearchPayload) {
	if (!search.metadata) {
		throw new Error('Missing required relations')
	}

	return { id: search.id, metadata: getMetadata(search.metadata) }
}

export type Search = ReturnType<typeof toSearch>
