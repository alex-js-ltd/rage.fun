import { prisma } from '@/app/utils/db'
import { Prisma, SwapType, SwapEvent, HarvestEvent } from '@prisma/client'

import { type EventData } from '@repo/rage'

import { updateBondingCurveState } from '@/app/webhook/swap'

import { getServerEnv } from '@/app/utils/env'
import * as Ably from 'ably'
import { getTokenWithRelations } from '@/app/data/get_token'

// ALERTS

import { sendUpdateAlertToAbly } from '@/app/webhook/ably'
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

	for await (const event of harvestEvents) {
		try {
			const harvestAlert = await upsertHarvestEvent(event)

			await updateBondingCurveState(harvestAlert.tokenId)

			const token = await getTokenWithRelations(harvestAlert.tokenId)

			await sendUpdateAlertToAbly(updateChannel, token, 'Harvest')
		} catch (err) {
			console.error('processHarvestEvents error', {
				signature: event.signature,
				mint: event.data.mint?.toBase58(),
				err,
			})
		}
	}
}
