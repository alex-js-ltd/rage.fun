import { TokenWithRelationsType, WalletSchema, WalletType } from '@/app/utils/schemas'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'

import { connection } from '@/app/utils/setup'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import 'server-only'

export const dynamic = 'force-dynamic'

export async function getTokenList(wallet?: string) {
	if (!wallet) return []

	const accounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(wallet), {
		programId: TOKEN_2022_PROGRAM_ID,
	})

	const userTokens = accounts.value.reduce<Record<string, number>>((acc, curr) => {
		const info = curr.account.data.parsed.info
		const mint = info.mint
		const uiAmount = info.tokenAmount.uiAmount
		const tokenAmount = info.tokenAmount

		if (uiAmount > 0) {
			acc[mint] = tokenAmount
		}

		return acc
	}, {})

	const mints = Object.keys(userTokens)

	const tokens = await prisma.tokenMetadata.findMany({
		select,
		where: {
			id: {
				in: mints,
			},
			bondingCurve: {
				isNot: null,
			},
			nsfw: {
				isNot: null,
			},
		},
	})

	const data = tokens.reduce<WalletType[]>((acc, curr) => {
		const mint = curr.id

		const tokenAmount = userTokens[mint]

		const value = { ...curr, tokenAmount }

		const parsed = WalletSchema.safeParse(value)

		if (parsed.success) {
			acc.push(parsed.data)
		}

		return acc
	}, [])

	return data
}

const select = Prisma.validator<Prisma.TokenMetadataSelect>()({
	id: true,
	name: true,
	symbol: true,
	description: true,
	image: true,
	thumbhash: true,
	creatorId: true,
	createdAt: true,
	updatedAt: true,

	bondingCurve: {
		select: {
			id: true,
			progress: true,
			connectorWeight: true,
			decimals: true,
			startTime: true,
			totalSupply: true,
			reserveBalance: true,
			targetReserve: true,
			marketCap: true,
			tokenId: true,
			createdAt: true,
			updatedAt: true,
		},
	},
	nsfw: {
		select: {
			isNsfw: true,
		},
	},

	swapEvents: {
		select: {
			id: true,
			signer: true,
			time: true,
			price: true,
			amount: true,
			lamports: true,
			swapType: true,
			tokenId: true,
		},
		where: {
			price: {
				not: 0, // Exclude records where price is 0
			},
		},
		orderBy: {
			time: 'desc', // Or another timestamp field like 'timestamp'/'blockTime'
		},
		take: 2, // Limit to last 2 events
	},
})
