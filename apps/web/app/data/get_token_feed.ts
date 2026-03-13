import { prisma, selectTokenFeed as select, type Prisma } from '@repo/database'
import { type SearchParams } from '@/app/utils/types'

const TAKE: number = 12

export async function getTokenFeed(searchParams: SearchParams) {
	const { sortType, sortOrder, cursorId, creatorId } = searchParams

	const tokens = await prisma.token.findMany({
		where: getWhere({ sortType, sortOrder, creatorId }),
		select,
		take: TAKE + 1,
		skip: cursorId ? 1 : 0,
		cursor: getCursor(cursorId),
		orderBy: [...getOrderBy({ sortType, sortOrder })],
	})
}

function getWhere({ sortType, creatorId }: SearchParams & { creatorId?: string }) {
	const base = {
		bondingCurve: { isNot: null },
		...(creatorId ? { creatorId: { equals: creatorId } } : {}),
	} satisfies Prisma.TokenWhereInput

	switch (sortType) {
		case 'lastTrade':
			return {
				...base,
				swapEvents: { some: {} },
			} satisfies Prisma.TokenWhereInput

		case 'createdAt':
		case 'volume':
		case 'marketCap':
			return base

		default:
			throw new Error(`Unsupported sortType: ${sortType}`)
	}
}

function getCursor(cursorId: SearchParams['cursorId']): Prisma.TokenFindManyArgs['cursor'] {
	return cursorId ? { id: cursorId } : undefined
}

function getOrderBy({ sortType, sortOrder }: SearchParams): Prisma.TokenOrderByWithRelationInput[] {
	const base = [{ createdAt: sortOrder }, { id: sortOrder }] satisfies Prisma.TokenOrderByWithRelationInput[]

	switch (sortType) {
		case 'createdAt':
			return [...base]

		case 'lastTrade':
			return [{ bondingCurve: { updatedAt: sortOrder } }, ...base]

		case 'volume':
			return [{ marketData: { volume: sortOrder } }, ...base]

		case 'marketCap':
			return [{ marketData: { marketCap: sortOrder } }, { marketData: { liquidity: sortOrder } }, ...base]

		default:
			throw new Error(`Unsupported sortType: ${sortType}`)
	}
}
