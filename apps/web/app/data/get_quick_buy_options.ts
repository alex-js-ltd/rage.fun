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

export async function getQuickBuyOptions(signer?: string | undefined): Promise<QuickOption[]> {
	if (!signer) {
		return defaultOptions
	}

	const lamports = await connection.getBalance(new PublicKey(signer), 'confirmed')

	if (lamports < 10) {
		return defaultOptions
	}

	const TX_FEE_BUFFER = BigInt(155_000) // ~0.000155 SOL for base + priority

	const balance = BigInt(lamports)

	const effective = balance > TX_FEE_BUFFER ? balance - TX_FEE_BUFFER : BigInt(0)

	const full = effective
	const half = balance / BigInt('2')
	const quarter = balance / BigInt('4')

	const decimals = 9

	const options = [
		{ label: '25%', uiAmount: fromLamports(new BN(quarter.toString()), decimals).toFixed(decimals) },
		{ label: '50%', uiAmount: fromLamports(new BN(half.toString()), decimals).toFixed(decimals) },
		{ label: '100%', uiAmount: fromLamports(new BN(full.toString()), decimals).toFixed(decimals) },
	]

	return options
}
