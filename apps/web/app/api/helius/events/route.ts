import { NextRequest, NextResponse } from 'next/server'
import { HeliusSchema } from '@/app/utils/schemas'
import { connection, program } from '@/app/utils/setup'
import { fetchAllEvents, groupEvents } from '@repo/magicmint'
import { getServerEnv } from '@/app/utils/env'
import { processSwapEvents } from '@/app/webhook/swap'
import { processCreateEvents } from '@/app/webhook/create'
import { processAirdropEvents } from '@/app/webhook/airdrop'
import { processHarvestEvents } from '@/app/webhook/harvest'
import { processRaydiumEvents } from '@/app/webhook/raydium'

const { HELIUS_SECRET } = getServerEnv()

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

	const events = await fetchAllEvents({ program, signatureList, connection })

	const { swapEvent, createEvent, airdropEvent, harvestEvent, raydiumEvent } = groupEvents(events)

	console.log('events', { swapEvent, createEvent, airdropEvent, harvestEvent, raydiumEvent })

	await processSwapEvents(swapEvent)

	await processCreateEvents(createEvent)

	await processAirdropEvents(airdropEvent)

	await processHarvestEvents(harvestEvent)

	await processRaydiumEvents(raydiumEvent)

	// Return a success response
	return NextResponse.json(
		{
			message: 'Submission successful',
			data: events,
		},
		{ status: 201 },
	)
}
