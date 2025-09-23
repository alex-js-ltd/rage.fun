import { getServerEnv } from '@/app/utils/env'

import { fromLamports, amountToUiAmount } from '@repo/rage'
import { generateSolanaBlink } from '@/app/utils/dialect'

import { type TokenFeedType, SwapEventType } from '@/app/utils/schemas'

import { BN } from '@coral-xyz/anchor'
import { formatTokenAmount } from '@/app/utils/misc'
import { type TopHolderType } from '@/app/utils/schemas'
import { getCachedSolPrice } from '@/app/data/get_sol_price'

import { client } from '@/app/utils/client'
import { HarvestEvent } from '@prisma/client'

const {} = getServerEnv()

export async function publishSwapEvent(event: SwapEventType, token: TokenFeedType, topHolders: TopHolderType[]) {
	const { symbol } = token.metadata
	const { currentSupply, decimals } = token.bondingCurve
	const { progress } = token.marketData

	const circulatingSupply = amountToUiAmount(new BN(currentSupply), decimals)
	const formattedcirculatingSupply = formatTokenAmount(circulatingSupply)

	// Format the alert message
	const alertMessage = event.swapType === 'Buy' ? '🤑 **NEW MINT** 🤑' : '🔥 **NEW BURN** 🔥'

	const amount = amountToUiAmount(new BN(event.tokenAmount), decimals)

	const formattedAmount = formatTokenAmount(amount)

	const solScanUrl = `https://solscan.io/tx/${event.id}`
	const magicmintUrl = `https://www.letsrage.fun/token/${token.id}?interval=86400000`
	const dialectUrl = generateSolanaBlink(token.id)

	const topHolderLines = topHolders
		.reduce<string[]>((acc, curr) => {
			if (curr.percentageOwned !== '0.00') {
				acc.push(`├ ${curr.owner}: ${curr.percentageOwned}%`)
			}

			return acc // No bold
		}, [])
		.slice(0, 5)

	const refund = await getRefund(event)

	const caption = [
		`${alertMessage}`,
		'',
		// TOKEN INFO SECTION
		`**🪙 ${symbol}**`,
		`** ├Amount: \`${formattedAmount}\`**`,
		`** ├Price per Token: \`${event.price.toFixed(9)} SOL\`**`,

		...refund,

		// BONDING CURVE SECTION
		`**🌀 BONDING CURVE**`,
		`** ├Ciculating Supply: ${formattedcirculatingSupply}**`,
		`** ├Progress: ${progress}%**`,
		'',

		// TOP HOLDERS
		`**📊 DISTRIBUTION | TOP HOLDERS**`,

		...topHolderLines,

		'',

		// LINKS SECTION
		`**🔗 LINKS**`,
		`** ├**[**solscan.io**](<${solScanUrl}>)`,
		`** ├**[**letsrage.fun**](<${magicmintUrl}>)`,
		`** ├**[**Buy on Dialect**](${dialectUrl})`,
	].join('\n')

	// Then in your Discord webhook payload:
	const payload = {
		content: caption,
	}

	try {
		const res = await client('', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		console.log('✅ Webhook sent:', res)
	} catch (error) {
		console.error('❌ Failed to send Discord alert:', error)
	}
}

async function getRefund(event: SwapEventType) {
	if (event.rentAmount === '0' || event.swapType === 'Buy') {
		return ['']
	}

	const solPrice = await getCachedSolPrice()

	const refundInLamports = fromLamports(new BN(event.rentAmount), 9)

	const refundAmount = refundInLamports * solPrice

	const rent = ['', `**🔄 Refunded Rent**`, `** ├Amount: \`$ ${refundAmount.toFixed(2)}\`**`, '']

	return rent
}
