import { connection } from '@/app/utils/setup'
import { PublicKey } from '@solana/web3.js'
import { QuickOption } from '@/app/comps/swap_form'
import { getAccount, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { getCachedDecimals } from '@/app/data/get_decimals'
import { fromLamports } from '@repo/rage'
import { BN } from '@coral-xyz/anchor'
import 'server-only'

export const dynamic = 'force-dynamic'

const defaultOptions = [
	{ label: '25%', uiAmount: '' },
	{ label: '50%', uiAmount: '' },
	{ label: '100%', uiAmount: '' },
]

export async function getQuickSellOptions(mint: string, signer?: string | undefined): Promise<QuickOption[]> {
	if (!signer) {
		return defaultOptions
	}

	const token0SignerAta = await getAssociatedTokenAddress(
		new PublicKey(mint),
		new PublicKey(signer),
		true,
		TOKEN_2022_PROGRAM_ID,
	)

	const info = await connection.getAccountInfo(token0SignerAta, 'confirmed')
	if (!info) {
		// account doesn’t exist → just return defaults
		return defaultOptions
	}

	const account = await getAccount(connection, token0SignerAta, 'confirmed', TOKEN_2022_PROGRAM_ID)

	const full = account.amount
	const half = account.amount / BigInt('2')
	const quarter = account.amount / BigInt('4')

	const decimals = await getCachedDecimals(mint)

	const options: QuickOption[] = [
		{ label: '25%', uiAmount: fromLamports(new BN(quarter.toString()), decimals).toFixed(decimals) },
		{ label: '50%', uiAmount: fromLamports(new BN(half.toString()), decimals).toFixed(decimals) },
		{ label: '100%', uiAmount: fromLamports(new BN(full.toString()), decimals).toFixed(decimals) },
	]

	return options
}
