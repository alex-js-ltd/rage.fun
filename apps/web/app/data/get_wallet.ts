import {} from '@/app/utils/schemas'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'

import { connection } from '@/app/utils/setup'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import 'server-only'

export const dynamic = 'force-dynamic'

export async function getWallet(wallet?: string) {
	if (!wallet) return []

	const accounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(wallet), {
		programId: TOKEN_2022_PROGRAM_ID,
	})

	const rageTokens = await prisma.token.findMany({
		include: { bondingCurve: true },
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

	const tokens = await prisma.token.findMany({
		where: {
			id: {
				in: mints,
			},
		},

		include: { bondingCurve: true },
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
