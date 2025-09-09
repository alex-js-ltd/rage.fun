import { parseWithZod } from '@conform-to/zod'
import { type SearchParams, SearchSchema } from '@/app/utils/schemas'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { getCachedSolPrice } from '@/app/data/get_sol_price'
import { createTokenFeedSchema } from '@/app/utils/schemas'
import { getVolume } from './get_volume'
import { getTransactionCount } from './get_transaction_count'
import 'server-only'

export async function getTokens(searchParams: SearchParams) {
	const submission = SearchSchema.safeParse(searchParams)

	if (submission.error) {
		console.error(submission)
		return { tokens: [], isLastPage: false, searchParams }
	}

	const { sortType, sortOrder, cursorId, creatorId } = submission.data

	console.log('creatorId', creatorId)

	const tokens = await prisma.token.findMany({
		where: getWhere(creatorId),
		select,
		take: TAKE + 1,
		skip: 0,
		cursor: getCursor(cursorId),
		orderBy: [...getOrderBy({ sortType, sortOrder })],
	})

	const solPricePromise = getCachedSolPrice()

	const promise = tokens.map(async token => {
		const transactionPromise = getTransactionCount(token.id)
		const volumePromise = getVolume(token.id)

		const TokenFeedSchema = await createTokenFeedSchema({
			solPricePromise,
			transactionPromise,
			volumePromise,
		})

		const parsed = await TokenFeedSchema.safeParseAsync(token)

		if (!parsed.success) {
			console.error(parsed.error.format())
			throw new Error('Invalid token with relations')
		}

		return parsed.data
	}, [])

	const data = await Promise.all(promise)

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

function getWhere(creatorId?: string) {
	if (creatorId) {
		return Prisma.validator<Prisma.TokenWhereInput>()({
			bondingCurve: {
				isNot: null,
			},

			creatorId: { equals: creatorId },
		})
	}

	return Prisma.validator<Prisma.TokenWhereInput>()({
		bondingCurve: {
			isNot: null,
		},
	})
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

			initialSupply: true,
			currentSupply: true,
			targetSupply: true,

			initialReserve: true,
			currentReserve: true,
			targetReserve: true,

			tradingFees: true,
			openTime: true,

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

		case 'updatedAt':
			return Prisma.validator<Prisma.TokenOrderByWithRelationInput[]>()([
				{ bondingCurve: { updatedAt: sortOrder } },
				{ bondingCurve: { id: sortOrder } },
			])

		default:
			throw new Error(`Unsupported sortType: ${sortType}`)
	}
}
