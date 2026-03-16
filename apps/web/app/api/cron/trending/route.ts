import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getServerEnv } from '@/app/utils/env'
import { prisma } from '@repo/database'
import dayjs from 'dayjs'
import { getTrendingTokens } from '@/app/data/get_trending_tokens'
import { selectTrending as select } from '@repo/database'
import type { TrendingRow } from '@repo/database'

import * as Ably from 'ably'
import * as AblyEvents from '@/app/webhooks/ably'

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
		select,
		orderBy: { marketData: { volume: 'desc' } },
		take: 3,
	})

	const data = rows.map(toTrending)

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

function toTrending(token: TrendingRow) {
	if (!token.metadata || !token.marketData) {
		throw new Error('Missing required relations')
	}

	return {
		id: token.id,
		metadata: { ...token.metadata, thumbhash: Buffer.from(token.metadata.thumbhash).toString('base64') },
	}
}

export type Trending = ReturnType<typeof toTrending>
