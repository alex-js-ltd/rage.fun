import * as Ably from 'ably'
import {
	type TokenFeedType,
	type SwapEventType,
	type UpdateEnumType,
	type TopHolderType,
	type CommentType,
	type TransactionTableType,
	type PnlType,
} from '@/app/utils/schemas'
import { type SignatureStatus } from '@solana/web3.js'
import 'server-only'
import { type TokenCard } from '@/app/data/get_tokens'
import { type SwapConfig } from '@/app/data/get_swap_config'

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

export async function publishSwapConfigEvent(channel: Ably.Channel, event: SwapConfig) {
	try {
		await channel.publish('swapConfigEvent', { ...event })
	} catch (error) {
		console.error(error)
	}
}

export async function publishUpdateEvent(channel: Ably.Channel, token: TokenCard, updateType: UpdateEnumType) {
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

export async function publishTopHoldersEvent(channel: Ably.Channel, holders: TopHolderType[], token: TokenCard) {
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

export async function publishTrendingEvent(channel: Ably.Channel, tokens: TokenFeedType[]) {
	try {
		await channel.publish('trendingEvent', { tokens })
	} catch (error) {
		console.error(error)
	}
}

export async function publishPnLEvent(channel: Ably.Channel, pnl: PnlType) {
	try {
		await channel.publish('pnlEvent', { ...pnl })
	} catch (error) {
		console.error(error)
	}
}
