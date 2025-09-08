import { parseWithZod } from '@conform-to/zod'
import { type SearchParams, type TokenWithRelationsType, SearchSchema } from '@/app/utils/schemas'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { calculatePercentageDifference } from '@/app/utils/misc'
import { unstable_cache } from 'next/cache'
import 'server-only'

export const Interval = {
	'5m': 5 * 60_000,
	'1h': 60 * 60_000,
	'6h': 6 * 60 * 60_000,
	'24h': 24 * 60 * 60_000,
} as const

export async function getPriceDeltas(
	mint: string,
): Promise<{ '5m': number; '1h': number; '6h': number; '24h': number }> {
	// 1) latest trade (P_end)
	const latest = await prisma.swapEvent.findFirst({
		where: { tokenId: mint, price: { not: 0 } },
		orderBy: { time: 'desc' },
		select: { price: true, time: true },
	})

	console.log('latest', latest)

	if (!latest) {
		return { '5m': 0, '1h': 0, '6h': 0, '24h': 0 }
	}

	const lastPrice = latest.price

	const now = BigInt(Date.now())

	const priceDeltas = Object.entries(Interval).map(async curr => {
		const [key, value] = curr

		// Calculate cutoff time correctly
		const cutoff = now - BigInt(value)
		const lte = cutoff / BigInt(1000)

		const start = await prisma.swapEvent.findFirst({
			where: { tokenId: mint, price: { not: 0 }, time: { lte } },
			orderBy: { time: 'desc' },
			select: { price: true },
		})

		if (!start) {
			return [key, 0] as const
		}

		const startPrice = start.price

		const pct = calculatePercentageDifference(startPrice, lastPrice)

		return [key, pct] as const
	})

	const entries = await Promise.all(priceDeltas)

	return Object.fromEntries(entries) as Record<keyof typeof Interval, number>
}

export function getCachedPriceDeltas(mint: string) {
	return unstable_cache(
		async () => {
			return await getPriceDeltas(mint)
		},
		[mint], // add mint to the cache key
		{
			tags: [`price-deltas-${mint}`],
		},
	)()
}
