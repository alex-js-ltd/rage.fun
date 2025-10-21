import { prisma } from '@/app/utils/db'
import { Prisma, SwapType, SwapEvent, HarvestEvent } from '@prisma/client'

import { type EventData } from '@repo/rage'

import { updateBondingCurveState, updateMarketData } from '@/app/webhook/swap'

import { getServerEnv } from '@/app/utils/env'
import * as Ably from 'ably'
import { getTokenFeed } from '@/app/data/get_token_feed'
import { program } from '@/app/utils/setup'
import { fetchBondingCurveState } from '@repo/rage'

import * as AblyEvents from '@/app/webhook/ably'
import * as DiscordAlerts from '@/app/webhook/discord'
import { TokenFeedType } from '@/app/utils/schemas'
import 'server-only'

const { ABLY_API_KEY, PROXY_PRIVATE_KEY } = getServerEnv()

export async function upsertHarvestEvent(eventData: EventData<'harvestEvent'>): Promise<HarvestEvent> {
	const { data, signature } = eventData

	const id = signature
	const signer = data.signer.toBase58()
	const time = BigInt(data.time.toString())

	const lamports = BigInt(data.lamports.toString())

	const tokenId = data.mint.toBase58()

	const create = Prisma.validator<Prisma.HarvestEventCreateInput>()({
		id,
		signer,
		time,
		lamports,
		token: { connect: { id: tokenId } },
	})

	const upsert = Prisma.validator<Prisma.HarvestEventUpsertArgs>()({
		where: { id: signature }, // this is your unique identifier
		create,
		update: {}, // Do nothing if it already exists
	})

	const harvestEvent = await prisma.harvestEvent.upsert(upsert)

	return harvestEvent
}

export async function processHarvestEvents(harvestEvents: EventData<'harvestEvent'>[]) {
	const client = new Ably.Rest(ABLY_API_KEY)
	const updateChannel = client.channels.get('updateEvent')
	const socialAlerts: Array<{ harvest: HarvestEvent; token: TokenFeedType }> = []

	for await (const event of harvestEvents) {
		try {
			const mint = event.data.mint

			const [harvest, state] = await Promise.all([
				upsertHarvestEvent(event),
				fetchBondingCurveState({
					program,
					mint,
				}),
			])

			await updateBondingCurveState(state)

			const token = await getTokenFeed(harvest.tokenId)

			await AblyEvents.publishUpdateEvent(updateChannel, token, 'Harvest')

			const alert: { harvest: HarvestEvent; token: TokenFeedType } = { harvest, token }
			socialAlerts.push(alert)
		} catch (err) {
			console.error('processHarvestEvents error', {
				signature: event.signature,
				mint: event.data.mint?.toBase58(),
				err,
			})
		}
	}

	for await (const alert of socialAlerts) {
		try {
			await DiscordAlerts.publishHarvestAlert(alert.harvest, alert.token)
		} catch (err) {
			console.error(`🔥 Error processing harvest alert for ${alert.token.id}:`, err)
		}
	}
}
