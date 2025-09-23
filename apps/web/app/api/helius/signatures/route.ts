import { NextRequest, NextResponse } from 'next/server'
import { getServerEnv } from '@/app/utils/env'
import * as Ably from 'ably'

import * as AblyEvents from '@/app/webhook/ably'
import { connection } from '@/app/utils/setup'

const { HELIUS_SECRET, ABLY_API_KEY } = getServerEnv()

export async function POST(request: NextRequest) {
	const requestHeaders = new Headers(request.headers)
	const authorization = requestHeaders.get('authorization')

	if (authorization !== HELIUS_SECRET) {
		return NextResponse.json('💩', { status: 403 })
	}

	// Parse the request body
	const body: Array<RawTransaction> = await request.json()

	const client = new Ably.Rest(ABLY_API_KEY)
	const sigChannel = client.channels.get('signatureEvent')

	for (const e of body) {
		const signature = e.transaction.signatures[0]

		const status = await connection.getSignatureStatus(signature)

		console.log('signature status', status.value)

		if (status.value) {
			await AblyEvents.publishSignatureEvent(sigChannel, { ...status.value, signature })
		}
	}

	// Return a success response
	return NextResponse.json(
		{
			message: 'Submission successful',
		},
		{ status: 200 },
	)
}

type RawTransaction = {
	blockTime: number
	indexWithinBlock: number
	meta: {
		err: unknown | null
		fee: number
		innerInstructions: unknown[]
		loadedAddresses: Record<string, unknown>
		logMessages: string[]
		postBalances: number[]
		postTokenBalances: unknown[]
		preBalances: number[]
		preTokenBalances: unknown[]
		rewards: unknown[]
	}
	slot: number
	transaction: {
		message: Record<string, unknown>
		signatures: string[]
	}
	version: number
}
