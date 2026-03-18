import { prisma } from '@repo/database'
import type { Prisma, HarvestEvent } from '@repo/database'

import { type EventData } from '@repo/rage'

import { updateBondingCurveState } from '@/app/webhooks/swap'

import { getServerEnv } from '@/app/utils/env'
import * as Ably from 'ably'

import { program } from '@/app/utils/setup'
import { fetchBondingCurveState } from '@repo/rage'
import { revalidatePath } from 'next/cache'

import * as AblyEvents from '@/app/webhooks/ably'
import * as DiscordAlerts from '@/app/webhooks/discord'

import { getTokenCard, type TokenCard } from '@/app/data/get_token_feed'

import 'server-only'

const { ABLY_API_KEY } = getServerEnv()

export async function upsertHarvestEvent(eventData: EventData<'harvestEvent'>): Promise<HarvestEvent> {
	const { data, signature } = eventData

	const id = signature
	const signer = data.signer.toBase58()
	const time = BigInt(data.time.toString())

	const lamports = BigInt(data.lamports.toString())

	const tokenId = data.mint.toBase58()

	const create = {
		id,
		signer,
		time,
		lamports,
		token: { connect: { id: tokenId } },
	} satisfies Prisma.HarvestEventCreateInput

	const upsert = {
		where: { id: signature }, // this is your unique identifier
		create,
		update: {}, // Do nothing if it already exists
	} satisfies Prisma.HarvestEventUpsertArgs

	const harvestEvent = await prisma.harvestEvent.upsert(upsert)

	return harvestEvent
}

export async function processHarvestEvents(harvestEvents: EventData<'harvestEvent'>[]) {
	const client = new Ably.Rest(ABLY_API_KEY)
	const updateChannel = client.channels.get('updateEvent')
	const socialAlerts: Array<{ harvest: HarvestEvent; token: TokenCard }> = []

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

			revalidatePath(`/earn`)

			const token = await getTokenCard(harvest.tokenId)

			await AblyEvents.publishUpdateEvent(updateChannel, token, 'Harvest')

			const alert: { harvest: HarvestEvent; token: TokenCard } = { harvest, token }
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
