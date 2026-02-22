import { WalletSchema, WalletType } from '@/app/utils/schemas'
import { prisma } from '@/app/utils/db'

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

export async function getRageWallet(wallet?: string) {
	if (!wallet) return []

	const accounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(wallet), {
		programId: TOKEN_2022_PROGRAM_ID,
	})

	const allTokens = accounts.value.reduce<Record<string, TokenAmount>>((acc, curr) => {
		const info = curr.account.data.parsed.info
		const mint = info.mint
		const uiAmount = info.tokenAmount.uiAmount
		const tokenAmount = info.tokenAmount

		if (uiAmount > 0) {
			acc[mint] = tokenAmount
		}

		return acc
	}, {})

	const mints = Object.keys(allTokens)

	const rageTokens = await prisma.token.findMany({
		where: {
			id: {
				in: mints,
			},
			bondingCurve: {
				isNot: null,
			},
			metadata: { isNot: null },
		},
		include: { metadata: true },
	})

	const rageWallet = rageTokens.reduce<WalletType[]>((acc, curr) => {
		const mint = curr.id

		const tokenAmount = allTokens[mint]

		const value = { metadata: curr.metadata, tokenAmount }

		const parsed = WalletSchema.safeParse(value)

		if (parsed.success) {
			acc.push(parsed.data)
		}

		return acc
	}, [])

	return rageWallet
}

function toRageWallet() {}
