import { parseWithZod } from '@conform-to/zod'
import { type SearchParams, SearchSchema } from '@/app/utils/schemas'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { getCachedSolPrice } from '@/app/data/get_sol_price'
import { createTokenWithRelationsSchema } from '@/app/utils/schemas'
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

	const tokens = await prisma.tokenMetadata.findMany({
		where: getWhere(creatorId),
		select,
		take: TAKE + 1,
		skip: 0,
		cursor: getCursor(cursorId),
		orderBy: [...getOrderBy({ sortType, sortOrder })],
	})

	const solPrice = getCachedSolPrice()

	const promise = tokens.map(async token => {
		const transactionCount = getTransactionCount(token.id)

		const TokenWithRelationsSchema = createTokenWithRelationsSchema({
			solPrice,
			transactionCount,
		})

		const parsed = await TokenWithRelationsSchema.safeParseAsync(token)

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
		return Prisma.validator<Prisma.TokenMetadataWhereInput>()({
			bondingCurve: {
				isNot: null,
			},
			nsfw: {
				isNot: null,
			},

			creatorId: { equals: creatorId },
		})
	}

	return Prisma.validator<Prisma.TokenMetadataWhereInput>()({
		bondingCurve: {
			isNot: null,
		},
		nsfw: {
			isNot: null,
		},
	})
}

const select = Prisma.validator<Prisma.TokenMetadataSelect>()({
	id: true,
	name: true,
	symbol: true,
	description: true,
	image: true,
	thumbhash: true,
	creatorId: true,
	createdAt: true,
	updatedAt: true,

	bondingCurve: {
		select: {
			id: true,
			progress: true,
			connectorWeight: true,
			decimals: true,
			startTime: true,
			totalSupply: true,
			reserveBalance: true,
			targetReserve: true,
			marketCap: true,
			volume: true,
			tradingFees: true,
			tokenId: true,
			createdAt: true,
			updatedAt: true,
		},
	},
	nsfw: {
		select: {
			isNsfw: true,
		},
	},
})

function getCursor(cursorId: SearchParams['cursorId']) {
	const cursor = cursorId ? { id: cursorId } : undefined
	return Prisma.validator<Prisma.TokenMetadataFindManyArgs['cursor']>()(cursor)
}

function getOrderBy({ sortType, sortOrder }: SearchParams) {
	switch (sortType) {
		case 'createdAt':
			return Prisma.validator<Prisma.TokenMetadataOrderByWithRelationInput[]>()([
				{ createdAt: sortOrder },
				{ id: sortOrder },
			])

		case 'progress':
			return Prisma.validator<Prisma.TokenMetadataOrderByWithRelationInput[]>()([
				{ bondingCurve: { progress: sortOrder } },
				{ bondingCurve: { id: sortOrder } },
			])

		case 'volume':
			return Prisma.validator<Prisma.TokenMetadataOrderByWithRelationInput[]>()([
				{ bondingCurve: { volume: sortOrder } },
				{ createdAt: 'desc' },
			])
		default:
			throw new Error(`Unsupported sortType: ${sortType}`)
	}
}
