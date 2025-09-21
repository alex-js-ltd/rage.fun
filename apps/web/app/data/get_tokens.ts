import { parseWithZod } from '@conform-to/zod'
import { type SearchParams, SearchSchema } from '@/app/utils/schemas'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { getCachedSolPrice } from '@/app/data/get_sol_price'
import { createTokenFeedSchema } from '@/app/utils/schemas'
import { getVolumeRecord } from './get_volume_record'
import { getTransactionRecord } from '@/app/data/get_transaction_record'
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
		skip: 0,
		cursor: getCursor(cursorId),
		orderBy: [...getOrderBy({ sortType, sortOrder })],
	})

	const solPrice = await getCachedSolPrice()

	const data = tokens.map(token => {
		const TokenFeedSchema = createTokenFeedSchema({
			solPrice,
		})

		const parsed = TokenFeedSchema.safeParse(token)

		if (!parsed.success) {
			console.error(parsed.error.format())
			throw new Error('Invalid token with relations')
		}

		return parsed.data
	}, [])

	// Determine if it's the last page by checking if we have fetched more than TAKE tokens
	const isLastPage = tokens.length <= TAKE // If we have only TAKE tokens, it's the last page

	return {
		tokens: data.slice(0, TAKE),
		isLastPage,
		searchParams,
		nextCursorId: data?.length > 0 ? data[data.length - 1].id : undefined,
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
				{ createdAt: sortOrder },
				{ id: sortOrder },
			])
		default:
			throw new Error(`Unsupported sortType: ${sortType}`)
	}
}
