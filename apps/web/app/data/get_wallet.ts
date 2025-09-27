import { prisma } from '@/app/utils/db'
import { connection } from '@/app/utils/setup'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import 'server-only'

export const dynamic = 'force-dynamic'

interface TokenAmount {
	amount: string
	decimals: number
	uiAmount: number
	uiAmountString: string
}

interface TokenAccount {
	mint: string
	tokenAmount: TokenAmount
}

export async function getWallet(wallet?: PublicKey) {
	if (!wallet) return []

	const accounts = await connection.getParsedTokenAccountsByOwner(wallet, {
		programId: TOKEN_2022_PROGRAM_ID,
	})

	const rageTokens = await prisma.token.findMany({
		include: { bondingCurve: true },
	})

	const userTokens = accounts.value.reduce<TokenAccount[]>((acc, curr) => {
		const info = curr.account.data.parsed.info
		const mint = info.mint
		const tokenAmount = info.tokenAmount

		const find = rageTokens.find(t => t.id === mint)

		const value = { mint, tokenAmount }

		if (find && tokenAmount.uiAmount > 0) {
			acc.push(value)
		}

		return acc
	}, [])

	return userTokens
}
