import { type SearchParams, SearchSchema } from '@/app/utils/schemas'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { getSolPrice } from '@/app/data/get_sol_price'
import { createTokenFeedSchema } from '@/app/utils/schemas'
import 'server-only'

export async function getTokens(searchParams: SearchParams) {
	const submission = SearchSchema.safeParse(searchParams)

	if (submission.error) {
		console.error(submission)
		return { tokens: [], isLastPage: false, searchParams }
	}

	const { sortType, sortOrder, cursorId, creatorId } = submission.data

	const tokens = await prisma.token.findMany({
		where: getWhere({ sortType, sortOrder, creatorId }),
		select,
		take: TAKE + 1,
		skip: cursorId ? 1 : 0,
		cursor: getCursor(cursorId),
		orderBy: [...getOrderBy({ sortType, sortOrder })],
	})

	const solPrice = await getSolPrice()
	const TokenFeedSchema = createTokenFeedSchema({
		solPrice,
	})

	const data = tokens.map(token => {
		const parsed = TokenFeedSchema.safeParse(token)

		if (!parsed.success) {
			console.error(parsed.error.format())
			throw new Error('Invalid token with relations')
		}

		return parsed.data
	})

	const hasMore = data.length > TAKE
	const section = hasMore ? data.slice(0, TAKE) : data

	return {
		tokens: section,
		isLastPage: !hasMore,
		searchParams,
		nextCursorId: hasMore ? section[section.length - 1].id : undefined, // ✅ from returned page
		creatorId,
	}
}

const TAKE: number = 12

function getWhere({ sortType, creatorId }: SearchParams & { creatorId?: string }) {
	switch (sortType) {
		case 'createdAt':
			return Prisma.validator<Prisma.TokenWhereInput>()({
				bondingCurve: {
					isNot: null,
				},

				...(creatorId && { creatorId: { equals: creatorId } }),
			})

		case 'lastTrade':
			return Prisma.validator<Prisma.TokenWhereInput>()({
				bondingCurve: {
					isNot: null,
				},
				swapEvents: { some: {} },
				...(creatorId && { creatorId: { equals: creatorId } }),
			})

		case 'volume':
			return Prisma.validator<Prisma.TokenWhereInput>()({
				bondingCurve: {
					isNot: null,
				},

				...(creatorId && { creatorId: { equals: creatorId } }),
			})

		case 'marketCap':
			return Prisma.validator<Prisma.TokenWhereInput>()({
				bondingCurve: {
					isNot: null,
				},

				...(creatorId && { creatorId: { equals: creatorId } }),
			})

		default:
			throw new Error(`Unsupported sortType: ${sortType}`)
	}
}

const select = Prisma.validator<Prisma.TokenSelect>()({
	id: true,
	creatorId: true,
	createdAt: true,
	updatedAt: true,

	metadata: {
		select: {
			name: true,
			symbol: true,
			description: true,
			image: true,
			thumbhash: true,

			createdAt: true,
			updatedAt: true,

			tokenId: true,
		},
	},

	bondingCurve: {
		select: {
			id: true,

			connectorWeight: true,
			decimals: true,

			virtualSupply: true,
			currentSupply: true,
			targetSupply: true,

			virtualReserve: true,
			currentReserve: true,
			targetReserve: true,

			tradingFees: true,
			openTime: true,

			status: true,

			createdAt: true,
			updatedAt: true,

			tokenId: true,
		},
	},

	marketData: {
		select: {
			id: true,

			price: true,
			marketCap: true,

			liquidity: true,
			volume: true,

			buyCount: true,
			sellCount: true,

			createdAt: true,
			updatedAt: true,

			tokenId: true,
		},
	},
})

function getCursor(cursorId: SearchParams['cursorId']) {
	const cursor = cursorId ? { id: cursorId } : undefined
	return Prisma.validator<Prisma.TokenFindManyArgs['cursor']>()(cursor)
}

function getOrderBy({ sortType, sortOrder }: SearchParams) {
	switch (sortType) {
		case 'createdAt':
			return Prisma.validator<Prisma.TokenOrderByWithRelationInput[]>()([{ createdAt: sortOrder }, { id: sortOrder }])

		case 'lastTrade':
			// Order by the bonding curve row's updatedAt (updated on every swap)
			return Prisma.validator<Prisma.TokenOrderByWithRelationInput[]>()([
				{ bondingCurve: { updatedAt: sortOrder } },
				{ createdAt: sortOrder },
				{ id: sortOrder },
			])

		case 'volume':
			// Order by the bonding curve row's updatedAt (updated on every swap)
			return Prisma.validator<Prisma.TokenOrderByWithRelationInput[]>()([
				{ marketData: { volume: sortOrder } },
				{ createdAt: sortOrder },
				{ id: sortOrder },
			])

		case 'marketCap':
			// Order by the bonding curve row's updatedAt (updated on every swap)
			return Prisma.validator<Prisma.TokenOrderByWithRelationInput[]>()([
				{ marketData: { marketCap: sortOrder } },
				{ marketData: { liquidity: sortOrder } },
				{ createdAt: sortOrder },
				{ id: sortOrder },
			])
		default:
			throw new Error(`Unsupported sortType: ${sortType}`)
	}
}
