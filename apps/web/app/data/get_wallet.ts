import {} from '@/app/utils/schemas'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'

import { connection } from '@/app/utils/setup'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import 'server-only'

export const dynamic = 'force-dynamic'

interface Wallet {
	mint: any
	uiAmount: any
	tokenAmount: any
}

export async function getWallet(wallet?: string) {
	if (!wallet) return []

	const accounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(wallet), {
		programId: TOKEN_2022_PROGRAM_ID,
	})

	const rageTokens = await prisma.token.findMany({
		include: { bondingCurve: true },
	})

	const userTokens = accounts.value.reduce<Wallet[]>((acc, curr) => {
		const info = curr.account.data.parsed.info
		const mint = info.mint
		const uiAmount = info.tokenAmount.uiAmount
		const tokenAmount = info.tokenAmount

		const find = rageTokens.find(t => t.id === mint)

		if (find) {
			const value = { mint, uiAmount, tokenAmount }

			acc.push(value)
		}

		return acc
	}, [])

	return userTokens
}
