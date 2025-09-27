import { type QuickOption } from '@/app/comps/swap_form'
import { connection } from '@/app/utils/setup'
import { PublicKey } from '@solana/web3.js'
import { fromLamports } from '@repo/rage'
import { BN } from '@coral-xyz/anchor'
import 'server-only'

export const dynamic = 'force-dynamic'

const defaultOptions = [
	{ label: '25%', uiAmount: '' },
	{ label: '50%', uiAmount: '' },
	{ label: '100%', uiAmount: '' },
]

const TX_FEE_BUFFER = BigInt(5_000_000)

export async function getQuickBuyOptions(signer?: string | undefined): Promise<QuickOption[]> {
	if (!signer) return defaultOptions

	const lamports = await connection.getBalance(new PublicKey(signer), 'confirmed')

	if (lamports < 10) return defaultOptions

	const balance = BigInt(lamports)

	// Subtract buffer so we never overspend
	const effective = balance > TX_FEE_BUFFER ? balance - TX_FEE_BUFFER : BigInt(0)

	const quarter = effective / BigInt(4)
	const half = effective / BigInt(2)
	const full = effective

	const decimals = 9

	const options = [
		{ label: '25%', uiAmount: fromLamports(new BN(quarter.toString()), decimals).toFixed(decimals) },
		{ label: '50%', uiAmount: fromLamports(new BN(half.toString()), decimals).toFixed(decimals) },
		{ label: 'Max', uiAmount: fromLamports(new BN(full.toString()), decimals).toFixed(decimals) },
	]

	return options
}
