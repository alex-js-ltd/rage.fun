import { type BondingCurveState, fetchBondingCurveState } from '@repo/magicmint'
import { program } from '@/app/utils/setup'
import { PublicKey } from '@solana/web3.js'
import 'server-only'

export async function getBondingCurveState(mint: string): Promise<BondingCurveState | null> {
	try {
		const data = await fetchBondingCurveState({
			program,
			mint: new PublicKey(mint),
		})
		return data
	} catch (error) {
		return null
	}
}

export { type BondingCurveState }
