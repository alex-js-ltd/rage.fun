import { getServerEnv } from '@/app/utils/env'

import { amountToUiAmount, fromLamports } from '@repo/magicmint'
import { generateSolanaBlink } from '@/app/utils/dialect'
import { TokenWithRelationsType, SwapEventType, AirdropSignatureType } from '@/app/utils/schemas'

import { BN } from '@coral-xyz/anchor'
import { formatTokenAmount } from '@/app/utils/misc'

import { type TopHolderType } from '@/app/utils/schemas'
import { shortAddress } from '@/app/utils/misc'
import { client } from '@/app/utils/client'

const { TELEGRAM_CHAT_ID, TELEGRAM_BOT_TOKEN } = getServerEnv()

async function sendSwapAlertToTelegram(
	event: SwapEventType,
	token: TokenWithRelationsType,

	topHolders: TopHolderType[],
) {
	const { bondingCurve } = token
	const { progress, totalSupply, decimals } = bondingCurve

	// Calculate and format values
	const circulatingSupply = amountToUiAmount(new BN(totalSupply), decimals)
	const formattedCirculatingSupply = formatTokenAmount(circulatingSupply)

	const amount = amountToUiAmount(new BN(event.amount), decimals)
	const formattedAmount = formatTokenAmount(amount)

	// Construct URLs
	const solScanUrl = `https://solscan.io/tx/${event.id}`
	const magicmintUrl = `https://www.magicmint.fun/token/${token.id}?interval=3600000`
	const dialectUrl = generateSolanaBlink(token.id)

	// Format the alert message header
	const alertMessage = event.swapType === 'BUY' ? '🔮 *NEW MINT ALERT* 🔮' : '🔥 *NEW BURN ALERT* 🔥'

	const topHolderLines = topHolders.reduce<string[]>((acc, curr) => {
		const address = shortAddress(curr.owner)

		if (curr.percentageOwned !== '0.00') {
			acc.push(`├ \`${address}\`: *${escapeMarkdownV2(curr.percentageOwned)}%*`)
		}

		return acc
	}, [])

	// Build the caption text similar to Discord's message.
	// Note: Telegram MarkdownV2 requires escaping special characters.
	const caption = [
		`${alertMessage}`,
		'',
		// TOKEN INFO SECTION
		`*🪙 ${escapeMarkdownV2(token.symbol)}*`,
		`*├Amount: ${escapeMarkdownV2(formattedAmount)}*`,
		`*└Price per Token: ${escapeMarkdownV2(event.price.toFixed(18))} SOL *`,
		'',
		// BONDING CURVE SECTION
		`*🌀 BONDING CURVE*`,
		`*├Circulating Supply: ${escapeMarkdownV2(formattedCirculatingSupply)}*`,
		`*└Progress: ${escapeMarkdownV2(progress.toFixed(2))}%*`,
		'',

		// TOP HOLDERS
		`*📊 DISTRIBUTION \\| TOP HOLDERS*`,

		...topHolderLines,

		'',
		// LINKS SECTION
		`*🔗 LINKS*`,
		`*├[solscan\\.io](${solScanUrl})*`,
		`*└[magicmint\\.fun](${magicmintUrl})*`,
		'',
	].join('\n')

	// Telegram API endpoint for sending a photo
	const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`

	const payload = {
		chat_id: TELEGRAM_CHAT_ID,
		photo: token.image, // Ensure this is a valid, direct image URL
		caption: caption,
		parse_mode: 'MarkdownV2',

		reply_markup: {
			inline_keyboard: [[{ text: 'Buy on Dialect', url: `${dialectUrl}` }]],
		},
	}

	try {
		const res = await client(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		console.log('✅ Webhook sent:', res)
	} catch (error) {
		console.error('Error sending message to Telegram:', error)
	}
}

function escapeMarkdownV2(text: string) {
	return text.replace(/([_*[\]()~`>#+\-=|{}\.!])/g, '\\$1')
}

async function sendAirdropAlertToTelegram(airdropSignature: AirdropSignatureType) {
	const {
		id: signature,
		tokenId: mint,
		airdropId,
		airdropEvents,
		token: {
			symbol,
			image,
			bondingCurve: { decimals },
		},
	} = airdropSignature

	const alertMessage = `🪂 **#${airdropId} AIRDROP UNLOCKED** 🪂`

	const userInfoLines = airdropEvents.reduce<string[]>((acc, curr) => {
		const reward = fromLamports(new BN(curr.amount), decimals)

		const address = shortAddress(curr.user)

		acc.push(`├ \`${address}\`: *${escapeMarkdownV2(reward.toFixed(0))}*`)

		return acc
	}, [])

	const solScanUrl = `https://solscan.io/tx/${signature}`
	const magicmintUrl = `https://www.magicmint.fun/token/${mint}?interval=3600000`
	const dialectUrl = generateSolanaBlink(mint)

	const caption = [
		`${escapeMarkdownV2(alertMessage)}`,
		'',
		`*🤝 COMMUNITY*`,
		`*├Token: ${escapeMarkdownV2(symbol)}*`,
		'',
		'*👥 USERS*',
		...userInfoLines,
		'',
		`*🔗 LINKS*`,
		`*├[solscan\\.io](${solScanUrl})*`,
		`*└[magicmint\\.fun](${magicmintUrl})*`,
	].join('\n')

	// Telegram API endpoint for sending a photo
	const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`

	const payload = {
		chat_id: TELEGRAM_CHAT_ID,
		photo: image, // Direct image URL
		caption: caption,
		parse_mode: 'MarkdownV2',

		reply_markup: {
			inline_keyboard: [[{ text: 'Buy on Dialect', url: `${dialectUrl}` }]],
		},
	}

	try {
		const res = await client(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		console.log('✅ Webhook sent:', res)
	} catch (error) {
		console.error('Error sending message to Telegram:', error)
	}
}

export { sendSwapAlertToTelegram, sendAirdropAlertToTelegram }
