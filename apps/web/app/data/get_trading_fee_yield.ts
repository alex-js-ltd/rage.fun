import { PublicKey } from '@solana/web3.js'
import { connection, program } from '@/app/utils/setup'
import { fromLamports, fetchTradingFeeYield } from '@repo/magicmint'
import 'server-only'

export async function getTradingFeeYield(mint: string) {
	const amount = await fetchTradingFeeYield({ program, connection, mint: new PublicKey(mint) })

	const uiAmount = fromLamports(amount, 9)

	return uiAmount
}
