import { type SearchParams, SearchSchema } from '@/app/utils/schemas'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { getSolPrice } from '@/app/data/get_sol_price'
import { solToUsd } from '@/app/utils/misc'
import Decimal from 'decimal.js'
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

	const data = tokens.map(item => toTokenCard(item, solPrice))

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
	metadata: {
		select: {
			name: true,
			symbol: true,
			description: true,
			image: true,
			thumbhash: true,
		},
	},
	bondingCurve: {
		select: {
			status: true,
			tradingFees: true,
			updatedAt: true,
			currentReserve: true,
			targetReserve: true,
		},
	},
	marketData: {
		select: {
			price: true,
			marketCap: true,

			liquidity: true,
			volume: true,

			buyCount: true,
			sellCount: true,
		},
	},
})

type TokenPayload = Prisma.TokenGetPayload<{
	select: typeof select
}>

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

function getMetadata(metadata: NonNullable<TokenPayload['metadata']>) {
	return { ...metadata, thumbhash: Buffer.from(metadata.thumbhash).toString('base64') }
}

function getBondingCurve(bondingCurve: NonNullable<TokenPayload['bondingCurve']>, solPrice: number) {
	return {
		updatedAt: bondingCurve.updatedAt.toISOString(),
		tradingFees: solToUsd(new Decimal(bondingCurve.tradingFees).div(1e9), solPrice).toNumber(),
		progress: calculatePercentage(bondingCurve.currentReserve, bondingCurve.targetReserve),
	}
}

function getMarketData(marketData: NonNullable<TokenPayload['marketData']>, solPrice: number) {
	const price = solToUsd(marketData.price, solPrice).toNumber()
	const marketCap = solToUsd(marketData.marketCap, solPrice).toNumber()
	const liquidityInSol = new Decimal(marketData.liquidity).div(1e9)
	const volumeInSol = new Decimal(marketData.volume).div(1e9)
	const liquidity = solToUsd(liquidityInSol, solPrice).toNumber()
	const volume = solToUsd(volumeInSol, solPrice).toNumber()

	return { price, marketCap, liquidity, volume, buyCount: marketData.buyCount, sellCount: marketData.sellCount }
}

function toTokenCard(token: TokenPayload, solPrice: number) {
	if (!token.metadata || !token.bondingCurve || !token.marketData) {
		throw new Error('Missing required relations')
	}

	return {
		id: token.id,
		creatorId: token.creatorId,
		metadata: getMetadata(token.metadata),
		bondingCurve: getBondingCurve(token.bondingCurve, solPrice),
		marketData: getMarketData(token.marketData, solPrice),
		updateType: undefined,
	}
}

function calculatePercentage(current: bigint, target: bigint) {
	return new Decimal(current.toString()).div(target.toString()).mul(100).toNumber()
}

export type TokenCard = ReturnType<typeof toTokenCard>
