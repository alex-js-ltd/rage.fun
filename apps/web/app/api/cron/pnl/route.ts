import { NextRequest, NextResponse } from 'next/server'
import { getServerEnv } from '@/app/utils/env'
import { prisma } from '@/app/utils/db'
import { upsertUserPnL } from '@/app/webhook/user'
import 'server-only'

export async function GET(req: NextRequest) {
	const { CRON_SECRET } = getServerEnv()

	const requestHeaders = new Headers(req.headers)
	const authorization = requestHeaders.get('authorization')

	console.log('authorization ', authorization)

	if (authorization !== `Bearer ${CRON_SECRET}`) {
		return NextResponse.json('💩', { status: 401 })
	}

	const user = await prisma.user.findMany({})

	for (const u of user) {
		await upsertUserPnL(u.id)
	}

	// Return a success response
	return NextResponse.json(
		{
			data: [],
		},
		{ status: 200 },
	)
}
