import { getServerEnv } from '@/app/utils/env'

import { type EventData, fromLamports, amountToUiAmount } from '@repo/rage'
import { buyBlink, generateSolanaBlink, sellBlink } from '@/app/utils/dialect'

import { type TokenFeedType, SwapEventType } from '@/app/utils/schemas'

import { BN } from '@coral-xyz/anchor'
import { formatNumberSmart, formatTokenAmount, shortAddress } from '@/app/utils/misc'
import { type TopHolderType } from '@/app/utils/schemas'
import { getSolPrice } from '@/app/data/get_sol_price'

import { client } from '@/app/utils/client'
import { HarvestEvent } from '@prisma/client'
import { solToUsd } from '@/app/utils/misc'
import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '@/app/utils/db'

const {
	DISCORD_WEBHOOK_ALERT_URL,
	DISCORD_WEBHOOK_CHAT_URL,
	DISCORD_WEBHOOK_HARVEST_URL,
	DISCORD_BOT_TOKEN,
	DISCORD_GUILD_ID,
	DISCORD_CREATOR_ROLE_ID,
} = getServerEnv()

export async function publishSwapEvent(event: SwapEventType, token: TokenFeedType, topHolders: TopHolderType[]) {
	const { symbol } = token.metadata
	const { currentReserve, currentSupply, decimals } = token.bondingCurve
	const { progress } = token.marketData

	const circulatingSupply = amountToUiAmount(new BN(currentSupply), decimals)
	const formattedcirculatingSupply = formatTokenAmount(circulatingSupply)

	const liquidity = fromLamports(new BN(currentReserve), 9)

	// Format the alert message
	const alertMessage = event.swapType === 'Buy' ? '🤑 **NEW MINT** 🤑' : '🔥 **NEW BURN** 🔥'

	const amount = amountToUiAmount(new BN(event.tokenAmount), decimals)

	const formattedAmount = formatTokenAmount(amount)

	const solScanUrl = `https://solscan.io/tx/${event.id}`
	const rageUrl = `https://www.letsrage.fun/token/${token.id}?interval=5m`
	const dialectBuy = buyBlink(token.id)
	const dialectSell = sellBlink(token.id)

	const topHolderLines = topHolders
		.reduce<string[]>((acc, curr) => {
			if (curr.percentageOwned !== '0.00') {
				acc.push(`├ ${shortAddress(curr.owner)}: ${curr.percentageOwned}%`)
			}

			return acc // No bold
		}, [])
		.slice(0, 5)

	const refund = await getRefund(event)

	const caption = [
		'',
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
		`** ├Liquidity: ${liquidity.toFixed(9)} / 80 SOL**`,
		'',

		// TOP HOLDERS
		`**📊 DISTRIBUTION | TOP HOLDERS**`,

		...topHolderLines,

		'',

		// LINKS SECTION
		`**🔗 LINKS**`,
		`** ├**[**solscan.io**](<${solScanUrl}>)`,
		`** ├**[**letsrage.fun**](<${rageUrl}>)`,
		`** ├**[**Buy on Dialect**](<${dialectBuy}>)`,
		`** ├**[**Sell on Dialect**](${dialectSell})`,

		'',
	].join('\n')

	// Then in your Discord webhook payload:
	const payload = {
		content: caption,
	}

	const res = await client(DISCORD_WEBHOOK_ALERT_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})

	console.log('✅ Webhook sent:', res)
}

async function getRefund(event: SwapEventType) {
	if (event.rentAmount === '0' || event.swapType === 'Buy') {
		return ['']
	}

	const solPrice = await getSolPrice()

	const refundInLamports = fromLamports(new BN(event.rentAmount), 9)

	const refundAmount = refundInLamports * solPrice

	const rent = ['', `**🔄 Refunded Rent**`, `** ├Amount: \`$ ${refundAmount.toFixed(2)}\`**`, '']

	return rent
}

export async function publishCreateAlert(event: EventData<'createEvent'>, token: TokenFeedType) {
	const alertMessage = '🆕 **NEW TOKEN** 🆕'

	const mint = event.data.mint.toBase58()
	const solScanUrl = `https://solscan.io/tx/${event.signature}`
	const letsRageUrl = `https://www.letsrage.fun/token/${mint}?interval=5m`
	const dialectUrl = generateSolanaBlink(mint)

	const caption = [
		``,
		`${alertMessage}`,
		'',
		// TOKEN INFO SECTION
		`**🪙 ${token.metadata.symbol}**`,
		`** ├Creator: \`${shortAddress(event.data.creator.toBase58())}\`**`,
		'',

		'',
		// LINKS SECTION
		`**🔗 LINKS**`,
		`** ├**[**solscan.io**](<${solScanUrl}>)`,
		`** ├**[**letrage.fun**](${letsRageUrl})`,
		`** ├**[**Buy on Dialect**](<${dialectUrl}>)`,

		'',
	].join('\n')

	// Then in your Discord webhook payload:
	const payload = {
		content: caption,
	}

	const res = await client(DISCORD_WEBHOOK_CHAT_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})

	console.log('✅ Webhook sent:', res)
}

export async function publishHarvestAlert(event: HarvestEvent, token: TokenFeedType) {
	const signature = event.id
	const mint = event.tokenId
	const creator = event.signer

	const { symbol } = token.metadata

	const alertMessage = '💰 **NEW HARVEST** 💰'

	const solPrice = await getSolPrice()

	const amountSol = new Decimal(event.lamports.toString()).div(1e9)

	const amountDollars = solToUsd(amountSol, solPrice).toNumber()

	const solScanUrl = `https://solscan.io/tx/${signature}`
	const rageUrl = `https://www.letsrage.fun/token/${mint}?interval=1m`
	const dialectUrl = generateSolanaBlink(mint)

	const caption = [
		`${alertMessage}`,

		'',
		`**👤** \`${shortAddress(creator)}\` ** just earned $${formatNumberSmart(amountDollars)} **`,
		'',

		// LINKS SECTION
		`**🔗 LINKS**`,
		`** ├**[**solscan.io**](<${solScanUrl}>)`,
		`** ├**[**letsrage.fun**](<${rageUrl}>)`,
		`** ├**[**Buy on Dialect**](<${dialectUrl}>)`,
	].join('\n')

	// Then in your Discord webhook payload:
	const payload = {
		content: caption,
	}

	const res = await client(DISCORD_WEBHOOK_HARVEST_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})

	console.log('harvest result:', res)
}

export async function linkDiscordAccount(discordId: string, userId: string) {
	const account = await prisma.account.upsert({
		where: {
			// composite unique identifier from @@id([provider, providerAccountId])
			provider_providerAccountId: {
				provider: 'discord',
				providerAccountId: discordId,
			},
		},
		update: {
			// if this Discord is already known, make sure it's linked to THIS wallet
			userId,
			type: 'oauth',
		},
		create: {
			userId,
			type: 'oauth',
			provider: 'discord',
			providerAccountId: discordId,
		},
	})

	return account
}

export async function assignCreatorRole(discordUserId: string) {
	const res = await client(
		`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/members/${discordUserId}/roles/${DISCORD_CREATOR_ROLE_ID}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
			},
		},
	)
	console.log(res)
	console.log(`✅ Assigned Creator role to Discord user ${discordUserId}`)
}
