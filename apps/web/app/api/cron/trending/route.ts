import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getServerEnv } from '@/app/utils/env'
import { prisma } from '@/app/utils/db'
import { createTokenFeedSchema, type TokenFeedType } from '@/app/utils/schemas'
import { getSolPrice } from '@/app/data/get_sol_price'
import dayjs from 'dayjs'
import { getTrendingTokens } from '@/app/data/get_trending_tokens'
import * as Ably from 'ably'
import * as AblyEvents from '@/app/webhook/ably'

import 'server-only'

const { ABLY_API_KEY } = getServerEnv()

export async function GET(req: NextRequest) {
	const { CRON_SECRET } = getServerEnv()

	const requestHeaders = new Headers(req.headers)
	const authorization = requestHeaders.get('authorization')

	console.log('authorization', authorization)
	console.log('CRON_SECRET', CRON_SECRET)

	if (authorization !== `Bearer ${CRON_SECRET}`) {
		return NextResponse.json('💩', { status: 401 })
	}

	const previous = await getTrendingTokens()

	const since = dayjs().subtract(5, 'minute').toDate()

	const rows = await prisma.token.findMany({
		where: {
			marketData: {
				is: { updatedAt: { gte: since } },
			},
			bondingCurve: { isNot: null },
			metadata: { isNot: null },
		},
		include: { metadata: true, bondingCurve: true, marketData: true },
		orderBy: { marketData: { volume: 'desc' } },
		take: 3,
	})

	const solPrice = await getSolPrice()

	const data = rows.map(token => {
		const TokenFeedSchema = createTokenFeedSchema({
			solPrice,
		})

		const parsed = TokenFeedSchema.safeParse(token)

		if (!parsed.success) {
			console.error(parsed.error.format())
			throw new Error('Invalid token with relations')
		}

		return parsed.data
	})

	const merged = [...data, ...previous]
	const deduped = merged.filter((item, index, self) => index === self.findIndex(t => t.id === item.id))
	const trending = deduped.slice(0, 3)

	await kv.set('trending_tokens', trending)

	const client = new Ably.Rest(ABLY_API_KEY)

	const trendingChannel = client.channels.get('trendingEvent')
	await AblyEvents.publishTrendingEvent(trendingChannel, trending)

	// Return a success response
	return NextResponse.json(
		{
			success: true,
		},
		{ status: 200 },
	)
}
