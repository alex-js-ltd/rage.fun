import * as Ably from 'ably'
import {
	type TokenFeedType,
	type SwapEventType,
	type UpdateEnumType,
	type TopHolderType,
	CommentType,
	TransactionTableType,
} from '@/app/utils/schemas'
import { type SignatureStatus } from '@solana/web3.js'
import 'server-only'

export async function publishSignatureEvent(
	channel: Ably.Channel,
	signatureStatus: SignatureStatus & { signature: string },
) {
	try {
		await channel.publish('signatureEvent', { ...signatureStatus })
	} catch (error) {
		console.error(error)
	}
}

export async function publishSwapEvent(channel: Ably.Channel, event: SwapEventType) {
	try {
		await channel.publish('swapEvent', { ...event })
	} catch (error) {
		console.error(error)
	}
}

export async function publishUpdateEvent(channel: Ably.Channel, token: TokenFeedType, updateType: UpdateEnumType) {
	try {
		await channel.publish('updateEvent', { ...token, updateType })
	} catch (error) {
		console.error(error)
	}
}

export async function publishTransactionEvent(channel: Ably.Channel, transaction: TransactionTableType) {
	try {
		await channel.publish('transactionEvent', { ...transaction })
	} catch (error) {
		console.error(error)
	}
}

export async function publishTopHoldersEvent(channel: Ably.Channel, holders: TopHolderType[], token: TokenFeedType) {
	try {
		await channel.publish('holdersEvent', { holders, id: token.id })
	} catch (error) {
		console.error(error)
	}
}

export async function publishCommentEvent(channel: Ably.Channel, comment: CommentType) {
	try {
		await channel.publish('commentEvent', { ...comment })
	} catch (error) {
		console.error(error)
	}
}
