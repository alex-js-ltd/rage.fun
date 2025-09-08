import { NextRequest, NextResponse } from 'next/server'
import * as Ably from 'ably'
import { getServerEnv } from '@/app/utils/env'

const { ABLY_API_KEY } = getServerEnv()

export async function POST(req: Request) {
	const clientId = (await req.formData()).get('clientId')?.toString() || process.env.DEFAULT_CLIENT_ID || 'NO_CLIENT_ID'
	const client = new Ably.Rest(ABLY_API_KEY)
	const tokenRequestData = await client.auth.createTokenRequest({ clientId: clientId })
	console.log(tokenRequestData)
	return NextResponse.json(tokenRequestData)
}
