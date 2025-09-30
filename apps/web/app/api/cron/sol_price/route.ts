import { NextRequest, NextResponse } from 'next/server'
import { CoinGeckoClient } from 'coingecko-api-v3'
import { kv } from '@vercel/kv'
import { getServerEnv } from '@/app/utils/env'
import 'server-only'

export async function GET(req: NextRequest) {
	const { CRON_SECRET } = getServerEnv()

	const requestHeaders = new Headers(req.headers)
	const authorization = requestHeaders.get('authorization')

	console.log(authorization)
	console.log(CRON_SECRET)
	if (authorization !== `Bearer ${CRON_SECRET}`) {
		return NextResponse.json('💩', { status: 401 })
	}

	const client = new CoinGeckoClient({
		timeout: 10000,
		autoRetry: true,
	})

	const data = await client.simplePrice({
		ids: 'solana', // CoinGecko ID for Solana
		vs_currencies: 'usd', // Get price in USD
	})

	const solPrice = data.solana.usd

	const res = await kv.set(`sol_price`, {
		usd: solPrice,
		time: Date.now(),
	})

	console.log(res)

	// Return a success response
	return NextResponse.json(
		{
			data: [],
		},
		{ status: 200 },
	)
}
