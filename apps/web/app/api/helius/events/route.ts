import { NextRequest, NextResponse } from 'next/server'
import { HeliusSchema } from '@/app/utils/schemas'
import { program } from '@/app/utils/setup'
import { Connection } from '@solana/web3.js'
import { fetchAllEvents, groupEvents } from '@repo/rage'
import { getServerEnv } from '@/app/utils/env'

import { processSwapEvents } from '@/app/webhooks/swap'
import { processCreateEvents } from '@/app/webhooks/create'
import { processHarvestEvents } from '@/app/webhooks/harvest'
import { processRaydiumEvents } from '@/app/webhooks/raydium'

const { HELIUS_SECRET, RPC_URL } = getServerEnv()

export async function POST(request: NextRequest) {
	const requestHeaders = new Headers(request.headers)
	const authorization = requestHeaders.get('authorization')

	if (authorization !== HELIUS_SECRET) {
		return NextResponse.json('💩', { status: 403 })
	}

	// Parse the request body
	const body = await request.json()

	const result = HeliusSchema.safeParse(body)

	if (!result.success) {
		return NextResponse.json(result.error.flatten().fieldErrors, { status: 404 })
	}

	const signatureList = result.data.map(el => el.signature)

	const connection = new Connection(RPC_URL, 'confirmed')

	const events = await fetchAllEvents({ program, signatureList, connection })

	const { swapEvent, createEvent, harvestEvent, raydiumEvent } = groupEvents(events)

	console.log('events', { createEvent, swapEvent, harvestEvent, raydiumEvent })

	await processCreateEvents(createEvent)

	await processSwapEvents(swapEvent)

	await processHarvestEvents(harvestEvent)

	await processRaydiumEvents(raydiumEvent)

	// Return a success response
	return NextResponse.json(
		{
			sucess: true,
		},
		{ status: 201 },
	)
}
