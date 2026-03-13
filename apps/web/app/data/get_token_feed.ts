import type { Prisma, TokenFeedRow } from '@repo/database'
import type { SearchParams } from '@/app/utils/types'

import { prisma, selectTokenFeed as select } from '@repo/database'
import { getSolPrice } from '@/app/data/get_sol_price'
import { calculatePercentage, solToUsd } from '@/app/utils/misc'
import Decimal from 'decimal.js'

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

function getMetadata(metadata: NonNullable<TokenFeedRow['metadata']>) {
	return { ...metadata, thumbhash: Buffer.from(metadata.thumbhash).toString('base64') }
}

function getBondingCurve(bondingCurve: NonNullable<TokenFeedRow['bondingCurve']>, solPrice: number) {
	return {
		updatedAt: bondingCurve.updatedAt.toISOString(),
		tradingFees: solToUsd(new Decimal(bondingCurve.tradingFees).div(1e9), solPrice).toNumber(),
		progress: calculatePercentage(bondingCurve.currentReserve, bondingCurve.targetReserve),
	}
}

function getMarketData(marketData: NonNullable<TokenFeedRow['marketData']>, solPrice: number) {
	const price = solToUsd(marketData.price, solPrice).toNumber()
	const marketCap = solToUsd(marketData.marketCap, solPrice).toNumber()
	const liquidityInSol = new Decimal(marketData.liquidity).div(1e9)
	const volumeInSol = new Decimal(marketData.volume).div(1e9)
	const liquidity = solToUsd(liquidityInSol, solPrice).toNumber()
	const volume = solToUsd(volumeInSol, solPrice).toNumber()

	return { price, marketCap, liquidity, volume, buyCount: marketData.buyCount, sellCount: marketData.sellCount }
}

function toTokenCard(token: TokenFeedRow, solPrice: number) {
	if (!token.metadata || !token.bondingCurve || !token.marketData) {
		throw new Error('Missing required relations')
	}

	return {
		id: token.id,
		creatorId: token.creatorId,
		metadata: getMetadata(token.metadata),
		bondingCurve: getBondingCurve(token.bondingCurve, solPrice),
		marketData: getMarketData(token.marketData, solPrice),
		updateType: undefined as UpdateType,
	}
}

type UpdateType = 'Buy' | 'Sell' | 'Create' | 'Harvest' | undefined
