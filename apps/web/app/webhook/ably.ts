import * as Ably from 'ably'
import {
	type TokenWithRelationsType,
	type AirdropSignatureType,
	type SwapEventType,
	type UpdateEnumType,
	type TopHolderType,
	CommentType,
	TransactionTableType,
} from '@/app/utils/schemas'
import { type SignatureStatus } from '@solana/web3.js'
import 'server-only'

async function sendSignatureAlertToAbly(
	channel: Ably.Channel,
	signatureStatus: SignatureStatus & { signature: string },
) {
	try {
		await channel.publish('signatureEvent', { ...signatureStatus })
	} catch (error) {
		console.error(error)
	}
}

async function sendSwapAlertToAbly(channel: Ably.Channel, event: SwapEventType) {
	try {
		await channel.publish('swapEvent', { ...event })
	} catch (error) {
		console.error(error)
	}
}

async function sendUpdateAlertToAbly(channel: Ably.Channel, token: TokenWithRelationsType, updateType: UpdateEnumType) {
	try {
		await channel.publish('updateEvent', { ...token, updateType })
	} catch (error) {
		console.error(error)
	}
}

async function sendAirdropAlertToAbly(channel: Ably.Channel, airdrop: AirdropSignatureType) {
	try {
		await channel.publish('airdropEvent', airdrop)
	} catch (error) {
		console.error(error)
	}
}

async function sendTransactionAlertToAbly(channel: Ably.Channel, transaction: TransactionTableType) {
	try {
		await channel.publish('transactionEvent', { ...transaction })
	} catch (error) {
		console.error(error)
	}
}

async function sendTopHoldersAlertToAbly(
	channel: Ably.Channel,
	holders: TopHolderType[],
	token: TokenWithRelationsType,
) {
	try {
		await channel.publish('holdersEvent', { holders, id: token.id })
	} catch (error) {
		console.error(error)
	}
}

async function sendCommentAlertToAbly(channel: Ably.Channel, comment: CommentType) {
	try {
		await channel.publish('commentEvent', { ...comment })
	} catch (error) {
		console.error(error)
	}
}

export {
	sendSignatureAlertToAbly,
	sendSwapAlertToAbly,
	sendTransactionAlertToAbly,
	sendUpdateAlertToAbly,
	sendAirdropAlertToAbly,
	sendTopHoldersAlertToAbly,
	sendCommentAlertToAbly,
}
