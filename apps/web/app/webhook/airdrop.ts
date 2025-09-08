import { type EventData } from '@repo/magicmint'
import { prisma } from '@/app/utils/db'
import { AirdropEvent, AirdropSignature, Prisma } from '@prisma/client'
import { getServerEnv } from '@/app/utils/env'
import { sendAirdropAlertToDiscord } from '@/app/webhook/discord'
import { sendAirdropAlertToTelegram } from '@/app/webhook/telegram'
import { sendAirdropAlertToAbly } from '@/app/webhook/ably'
import { sendAirdropAlertToTwitter } from '@/app/webhook/twitter'
import * as Ably from 'ably'
import { getAirdropSignature } from '@/app/data/get_airdrop_signature'

import 'server-only'

const { ABLY_API_KEY, PROXY_PRIVATE_KEY } = getServerEnv()

export async function upsertAirdropSignature(event: EventData<'airdropEvent'>): Promise<AirdropSignature> {
	const id = event.signature
	const tokenId = event.data.mint.toBase58()
	const airdropId = event.data.airdropId

	const upsert = Prisma.validator<Prisma.AirdropSignatureUpsertArgs>()({
		where: { id }, // this is your unique identifier

		update: {
			updatedAt: new Date(),
		},

		create: {
			id,
			tokenId,
			airdropId,
		},
	})

	const sig = await prisma.airdropSignature.upsert(upsert)

	return sig
}

export async function upsertAirdropEvents(
	signature: AirdropSignature,
	events: EventData<'airdropEvent'>[],
): Promise<AirdropEvent[]> {
	const result = await events.reduce<Promise<AirdropEvent[]>>(async (accProm, curr) => {
		// Wait for the previous promise to resolve
		const acc = await accProm

		const event = curr

		const user = event.data.user.toBase58()
		const time = BigInt(event.data.time.toString())

		const amount = BigInt(event.data.amount.toString())

		const create = Prisma.validator<Prisma.AirdropEventCreateInput>()({
			user,
			time,
			amount,
			signature: { connect: { id: signature.id } }, // ✅ Use `connect`
		})

		const upsert = Prisma.validator<Prisma.AirdropEventUpsertArgs>()({
			where: {
				user_signatureId: {
					user: event.data.user.toBase58(),
					signatureId: signature.id,
				},
			},
			update: {},
			create,
		})
		const airdropEvent = await prisma.airdropEvent.upsert(upsert)

		acc.push(airdropEvent)

		// Return the updated accumulator (still a promise)
		return acc
	}, Promise.resolve([])) // Start with an already resolved empty array

	return result
}

export async function processAirdropEvents(airdropEvents: EventData<'airdropEvent'>[]) {
	const groupedEvents = airdropEvents.reduce(
		(acc, event) => {
			const sig = event.signature

			if (!acc[sig]) {
				acc[sig] = []
			}
			acc[sig].push(event)
			return acc
		},
		{} as Record<string, EventData<'airdropEvent'>[]>,
	)

	const client = new Ably.Rest(ABLY_API_KEY)
	const channel = client.channels.get('airdropEvent')

	for (const [signature, events] of Object.entries(groupedEvents)) {
		if (events[0].data.airdropType.random || !events[0].data.airdropId) {
			console.log(`❗️dont index random airdrops`)
			continue
		}

		const result = await upsertAirdropSignature(events[0])
		await upsertAirdropEvents(result, events)

		const data = await getAirdropSignature(signature)

		if (data.createdAt === data.updatedAt) {
			await sendAirdropAlertToAbly(channel, data)
			await sendAirdropAlertToDiscord(data)
			await sendAirdropAlertToTelegram(data)
		}
	}
}
