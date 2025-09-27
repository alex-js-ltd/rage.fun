import { type QuickOption } from '@/app/comps/swap_form'
import { connection } from '@/app/utils/setup'
import { PublicKey } from '@solana/web3.js'
import { fromLamports } from '@repo/rage'
import { BN } from '@coral-xyz/anchor'
import 'server-only'

export const dynamic = 'force-dynamic'

export async function getQuickBuyOptions(signer?: string | undefined): Promise<QuickOption[]> {
	if (!signer) return []

	const lamports = await connection.getBalance(new PublicKey(signer), 'confirmed')

	const balance = BigInt(lamports)

	const full = balance
	const half = balance / BigInt('2')
	const quarter = balance / BigInt('4')

	const decimals = 9

	const options = [
		{ label: '100%', uiAmount: fromLamports(new BN(full.toString()), decimals).toFixed(decimals) },
		{ label: '50%', uiAmount: fromLamports(new BN(half.toString()), decimals).toFixed(decimals) },
		{ label: '25%', uiAmount: fromLamports(new BN(quarter.toString()), decimals).toFixed(decimals) },
	]

	return options
}
