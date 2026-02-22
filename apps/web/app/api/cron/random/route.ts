import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getServerEnv } from '@/app/utils/env'
import { prisma } from '@/app/utils/db'

import dayjs from 'dayjs'

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

	const since = dayjs().subtract(5, 'minute').toDate()

	const latest = await prisma.token.findMany({
		where: { createdAt: { lt: since } },
		orderBy: { createdAt: 'desc' },

		select: { id: true, createdAt: true },
		take: 1,
	})

	const randomIndex = Math.floor(Math.random() * latest.length)

	const token = latest[randomIndex]

	await kv.set('random_token', token)

	// Return a success response
	return NextResponse.json(
		{
			success: true,
		},
		{ status: 200 },
	)
}
