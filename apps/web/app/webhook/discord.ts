import { getServerEnv } from '@/app/utils/env'

import { type EventData, fromLamports, amountToUiAmount } from '@repo/magicmint'
import { generateSolanaBlink } from '@/app/utils/dialect'

import { type TokenWithRelationsType, AirdropSignatureType, SwapEventType } from '@/app/utils/schemas'

import { BN } from '@coral-xyz/anchor'
import { formatTokenAmount } from '@/app/utils/misc'
import { type TopHolderType } from '@/app/utils/schemas'
import { getCachedTokenMetadata } from '@/app/data/get_token_metadata'
import { getCachedSolPrice } from '@/app/data/get_sol_price'

import { client } from '@/app/utils/client'
import { HarvestEvent } from '@prisma/client'

const { DISCORD_WEBHOOK_URL_ALERTS, DISCORD_WEBHOOK_URL_CHAT } = getServerEnv()

async function sendCreateAlertToDiscord(event: EventData<'createEvent'>, token: TokenWithRelationsType) {
	const alertMessage = '🆕 **NEW TOKEN** 🆕'

	const mint = event.data.mint.toBase58()
	const solScanUrl = `https://solscan.io/tx/${event.signature}`
	const magicmintUrl = `https://www.magicmint.fun/token/${mint}?interval=86400000`
	const dialectUrl = generateSolanaBlink(mint)

	const caption = [
		`${alertMessage}`,
		'',
		// TOKEN INFO SECTION
		`**🪙 ${token.symbol}**`,
		`** ├Creator: \`${event.data.creator.toBase58()}\`**`,
		'',
		// BONDING CURVE SECTION
		`**🌀 BONDING CURVE**`,
		`** ├Progress: 0%**`,
		'',
		// LINKS SECTION
		`**🔗 LINKS**`,
		`** ├**[**solscan.io**](<${solScanUrl}>)`,
		`** ├**[**magicmint.fun**](<${magicmintUrl}>)`,
		`** ├**[**Buy on Dialect**](${dialectUrl})`,
		'',
	].join('\n')

	// Then in your Discord webhook payload:
	const payload = {
		content: caption,
	}

	try {
		const res = await client(DISCORD_WEBHOOK_URL_CHAT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		console.log('✅ Webhook sent:', res)
	} catch (error) {
		console.error('Error sending message to Discord:', error)
	}
}

async function sendSwapAlertToDiscord(
	event: SwapEventType,
	token: TokenWithRelationsType,
	topHolders: TopHolderType[],
) {
	const { bondingCurve } = token
	const { progress, totalSupply, decimals } = bondingCurve

	const circulatingSupply = amountToUiAmount(new BN(totalSupply), decimals)
	const formattedcirculatingSupply = formatTokenAmount(circulatingSupply)

	// Format the alert message
	const alertMessage = event.swapType === 'BUY' ? '🔮 **NEW MINT** 🔮' : '🔥 **NEW BURN** 🔥'

	const amount = amountToUiAmount(new BN(event.amount), bondingCurve.decimals)

	const formattedAmount = formatTokenAmount(amount)

	const solScanUrl = `https://solscan.io/tx/${event.id}`
	const magicmintUrl = `https://www.magicmint.fun/token/${token.id}?interval=86400000`
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
		`**🪙 ${token.symbol}**`,
		`** ├Amount: \`${formattedAmount}\`**`,
		`** ├Price per Token: \`${event.price.toFixed(18)} SOL\`**`,

		...refund,

		// BONDING CURVE SECTION
		`**🌀 BONDING CURVE**`,
		`** ├Ciculating Supply: ${formattedcirculatingSupply}**`,
		`** ├Progress: ${progress.toFixed(2)}%**`,
		'',

		// TOP HOLDERS
		`**📊 DISTRIBUTION | TOP HOLDERS**`,

		...topHolderLines,

		'',

		// LINKS SECTION
		`**🔗 LINKS**`,
		`** ├**[**solscan.io**](<${solScanUrl}>)`,
		`** ├**[**magicmint.fun**](<${magicmintUrl}>)`,
		`** ├**[**Buy on Dialect**](${dialectUrl})`,
	].join('\n')

	// Then in your Discord webhook payload:
	const payload = {
		content: caption,
	}

	try {
		const res = await client(DISCORD_WEBHOOK_URL_ALERTS, {
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
	if (event.rentAmount === '0' || event.swapType === 'BUY') {
		return ['']
	}

	const solPrice = await getCachedSolPrice()

	const refundInLamports = fromLamports(new BN(event.rentAmount), 9)

	const refundAmount = refundInLamports * solPrice

	const rent = ['', `**🔄 Refunded Rent**`, `** ├Amount: \`$ ${refundAmount.toFixed(2)}\`**`, '']

	return rent
}

async function sendAirdropAlertToDiscord(airdropSignature: AirdropSignatureType) {
	const {
		id: signature,
		tokenId: mint,
		airdropId,
		airdropEvents,
		token: {
			symbol,
			bondingCurve: { decimals },
		},
	} = airdropSignature

	const alertMessage = `🪂 **#${airdropId} AIRDROP UNLOCKED** 🪂`

	const userInfoLines = airdropEvents.map(event => {
		const reward = fromLamports(new BN(event.amount), decimals)

		return [`**👤 USER**`, `** ├Wallet: \`${event.user}\`**`, `** ├Amount: \`${reward}\` **`, ''].join('\n')
	})

	const solScanUrl = `https://solscan.io/tx/${signature}`
	const magicmintUrl = `https://www.magicmint.fun/token/${mint}?interval=86400000`
	const dialectUrl = generateSolanaBlink(mint)

	const caption = [
		`${alertMessage}`,
		'',
		`**🤝 COMMUNITY**`,
		`** ├Token: ${symbol}**`,

		'',
		...userInfoLines,

		// LINKS SECTION
		`**🔗 LINKS**`,
		`** ├**[**solscan.io**](<${solScanUrl}>)`,
		`** ├**[**magicmint.fun**](<${magicmintUrl}>)`,
		`** ├**[**Buy on Dialect**](${dialectUrl})`,
	].join('\n')

	// Then in your Discord webhook payload:
	const payload = {
		content: caption,
	}

	try {
		const res = await client(DISCORD_WEBHOOK_URL_ALERTS, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})
		console.log('✅ Webhook sent:', res)
	} catch (error) {
		console.error('❌ Failed to send Discord alert:', error)
	}
}

async function sendHarvestAlertoDiscord(event: HarvestEvent) {
	const signature = event.id
	const mint = event.tokenId
	const creator = event.signer

	const token = await getCachedTokenMetadata(mint)

	const alertMessage = '🛸 **NEW HARVEST** 🛸'

	const amount = fromLamports(new BN(event.lamports.toString()), 9)

	const solScanUrl = `https://solscan.io/tx/${signature}`
	const magicmintUrl = `https://www.magicmint.fun/token/${mint}?interval=86400000`
	const dialectUrl = generateSolanaBlink(mint)

	const caption = [
		`${alertMessage}`,
		'',

		`**🪙 ${token.symbol}**`,
		`** ├Creator: \`${creator}\`**`,
		`** ├Yield: \`${amount} SOL\`**`,
		'',

		// LINKS SECTION
		`**🔗 LINKS**`,
		`** ├**[**solscan.io**](<${solScanUrl}>)`,
		`** ├**[**magicmint.fun**](<${magicmintUrl}>)`,
		`** ├**[**Buy on Dialect**](${dialectUrl})`,
	].join('\n')

	// Then in your Discord webhook payload:
	const payload = {
		content: caption,
	}

	try {
		const res = await client(DISCORD_WEBHOOK_URL_ALERTS, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		console.log('✅ Webhook sent:', res)
	} catch (error) {
		console.error('Error sending message to Discord:', error)
	}
}

async function sendRaydiumAlertoDiscord(event: EventData<'raydiumEvent'>, token: TokenWithRelationsType) {
	const { id: mint, bondingCurve, symbol, creatorId } = token
	const { progress, totalSupply, decimals } = bondingCurve

	const circulatingSupply = amountToUiAmount(new BN(totalSupply), decimals)
	const formattedcirculatingSupply = formatTokenAmount(circulatingSupply)

	const alertMessage = [`🚀 **BONDING CURVE COMPLETE** 🚀`, ``, `🌐 **SWAPS LIVE ON RAYDIUM — USE THE LINK BELOW** 🌐`]

	const solScanUrl = `https://solscan.io/tx/${event.signature}`

	const raydiumUrl = `https://raydium.io/swap/?inputMint=${mint}&outputMint=sol`
	const birdEyeUrl = `https://birdeye.so/token/${mint}?chain=solana`

	const caption = [
		...alertMessage,
		'',

		`**🪙 ${symbol}**`,
		`** ├Creator: \`${creatorId}\`**`,

		'',

		// BONDING CURVE SECTION
		`**🌀 BONDING CURVE**`,
		`** ├Ciculating Supply: ${formattedcirculatingSupply}**`,
		`** ├Progress: ${progress.toFixed(2)}%**`,

		'',

		// LINKS SECTION
		`**🔗 LINKS**`,
		`** ├**[**solscan.io**](<${solScanUrl}>)`,
		`** ├**[**birdeye.so**](<${birdEyeUrl}>)`,
		`** ├**[**raydium.io**](${raydiumUrl})`,
	].join('\n')

	// Then in your Discord webhook payload:
	const payload = {
		content: caption,
	}

	try {
		const res = await client(DISCORD_WEBHOOK_URL_ALERTS, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		console.log('✅ Webhook sent:', res)
	} catch (error) {
		console.error('Error sending message to Discord:', error)
	}
}

async function sendIpBanToDiscord(ip: string) {
	const caption = ['🚨 **IP BAN** 🚨', '', `** ├Address: \`${ip}\`**`].join('\n')

	// Then in your Discord webhook payload:
	const payload = {
		content: caption,
	}

	try {
		const res = await client(DISCORD_WEBHOOK_URL_ALERTS, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		console.log('✅ Webhook sent:', res)
	} catch (error) {
		console.error('Error sending message to Discord:', error)
	}
}

export {
	sendCreateAlertToDiscord,
	sendSwapAlertToDiscord,
	sendAirdropAlertToDiscord,
	sendHarvestAlertoDiscord,
	sendRaydiumAlertoDiscord,
	sendIpBanToDiscord,
}
