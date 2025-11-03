import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { getServerEnv } from '@/app/utils/env'
import { getLeaderBoard } from '@/app/data/get_leader_board'
import 'server-only'

const { ABLY_API_KEY } = getServerEnv()

export async function GET(req: NextRequest) {
	const { CRON_SECRET } = getServerEnv()

	const requestHeaders = new Headers(req.headers)
	const authorization = requestHeaders.get('authorization')

	if (authorization !== `Bearer ${CRON_SECRET}`) {
		return NextResponse.json('💩', { status: 401 })
	}

	const leaderBoard = await getLeaderBoard(5)

	await kv.set('leader_board', leaderBoard)

	// Return a success response
	return NextResponse.json(
		{
			success: true,
		},
		{ status: 200 },
	)
}
