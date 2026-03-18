import * as Ably from 'ably'

import { type SignatureStatus } from '@solana/web3.js'

import { type SwapEvent } from '@/app/data/get_swap_events'
import { type TokenCard } from '@/app/data/get_token_feed'
import { type SwapConfig } from '@/app/data/get_swap_config'
import { type Trending } from '@/app/api/cron/trending/route'
import { type Comment } from '@/app/data/get_comments'
import { type TransactionData } from '@/app/data/get_transaction_data'
import { type TokenPnl } from '@/app/data/get_token_pnl'
import { type TopHolder } from '@/app/data/get_top_holders'

import { type UpdateEnumType } from '@/app/utils/schemas'

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

export async function publishSwapEvent(channel: Ably.Channel, event: SwapEvent) {
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

export async function publishTransactionEvent(channel: Ably.Channel, transaction: TransactionData) {
	try {
		await channel.publish('transactionEvent', { ...transaction })
	} catch (error) {
		console.error(error)
	}
}

export async function publishTopHoldersEvent(channel: Ably.Channel, holders: TopHolder[], token: TokenCard) {
	try {
		await channel.publish('holdersEvent', { holders, id: token.id })
	} catch (error) {
		console.error(error)
	}
}

export async function publishCommentEvent(channel: Ably.Channel, comment: Comment) {
	try {
		await channel.publish('commentEvent', { ...comment })
	} catch (error) {
		console.error(error)
	}
}

export async function publishTrendingEvent(channel: Ably.Channel, tokens: Trending[]) {
	try {
		await channel.publish('trendingEvent', { tokens })
	} catch (error) {
		console.error(error)
	}
}

export async function publishPnLEvent(channel: Ably.Channel, pnl: TokenPnl) {
	try {
		await channel.publish('pnlEvent', { ...pnl })
	} catch (error) {
		console.error(error)
	}
}
