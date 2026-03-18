import { prisma } from '@repo/database'

import { connection } from '@/app/utils/setup'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import 'server-only'

type TokenAmount = {
	amount: string // raw base units (numeric string)
	decimals: number // integer >= 0
	uiAmount: number // >= 0 (can be null in RPC, see note below)
	uiAmountString: string // decimal string
}

export type RageWallet = Record<string, TokenAmount>

export async function getRageWallet(wallet?: string): Promise<RageWallet> {
	if (!wallet) return {}

	const rageTokens = await prisma.token.findMany({
		where: {
			bondingCurve: {
				isNot: null,
			},
			metadata: { isNot: null },
		},

		select: { id: true },
	})

	const rageTokenSet = new Set(rageTokens.map(({ id }) => id))

	const accounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(wallet), {
		programId: TOKEN_2022_PROGRAM_ID,
	})

	const userTokens = accounts.value.reduce<Record<string, TokenAmount>>((acc, curr) => {
		const info = curr.account.data.parsed.info
		const mint = info.mint
		const uiAmount = info.tokenAmount.uiAmount
		const tokenAmount = info.tokenAmount

		if (uiAmount && uiAmount > 0 && rageTokenSet.has(mint)) {
			acc[mint] = tokenAmount
		}

		return acc
	}, {})

	return userTokens
}
