import { getServerEnv } from '@/app/utils/env'

import { amountToUiAmount } from '@repo/rage'
import { generateSolanaBlink } from '@/app/utils/dialect'
import { SwapEventType } from '@/app/utils/schemas'

import { BN } from '@coral-xyz/anchor'
import { formatTokenAmount } from '@/app/utils/misc'

import { type TopHolder } from '@/app/data/get_top_holders'
import { shortAddress } from '@/app/utils/misc'
import { client } from '@/app/utils/client'
import { type TokenAlert } from '@/app/data/get_token_alert'

const { TELEGRAM_CHAT_ID, TELEGRAM_BOT_TOKEN } = getServerEnv()

export async function publishSwapEvent(event: SwapEventType, token: TokenAlert, topHolders: TopHolder[]) {
	const { symbol, image } = token.metadata
	const { currentSupply, decimals, progress } = token.bondingCurve

	// Calculate and format values
	const circulatingSupply = amountToUiAmount(new BN(currentSupply), decimals)
	const formattedCirculatingSupply = formatTokenAmount(circulatingSupply)

	const amount = amountToUiAmount(new BN(event.tokenAmount), decimals)
	const formattedAmount = formatTokenAmount(amount)

	// Construct URLs
	const solScanUrl = `https://solscan.io/tx/${event.id}`
	const letsRageUrl = `https://www.letsrage.fun/token/${token.id}?interval=3600000`
	const dialectUrl = generateSolanaBlink(token.id)

	// Format the alert message header
	const alertMessage = event.swapType === 'Buy' ? '🤑 *NEW MINT ALERT* 🤑' : '🔥 *NEW BURN ALERT* 🔥'

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
		`*🪙 ${escapeMarkdownV2(symbol)}*`,
		`*├Amount: ${escapeMarkdownV2(formattedAmount)}*`,
		`*└Price per Token: ${escapeMarkdownV2(event.price.toFixed(9))} SOL *`,
		'',
		// BONDING CURVE SECTION
		`*🌀 BONDING CURVE*`,
		`*├Circulating Supply: ${escapeMarkdownV2(formattedCirculatingSupply)}*`,
		`*└Progress: ${escapeMarkdownV2(progress.toFixed(9))}%*`,
		'',

		// TOP HOLDERS
		`*📊 DISTRIBUTION \\| TOP HOLDERS*`,

		...topHolderLines,

		'',
		// LINKS SECTION
		`*🔗 LINKS*`,
		`*├[solscan\\.io](${solScanUrl})*`,
		`*└[letsrage\\.fun](${letsRageUrl})*`,
		'',
	].join('\n')

	// Telegram API endpoint for sending a photo
	const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`

	const payload = {
		chat_id: TELEGRAM_CHAT_ID,
		photo: image, // Ensure this is a valid, direct image URL
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
