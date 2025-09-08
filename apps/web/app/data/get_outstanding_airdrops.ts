import { fetchAirdropState } from '@repo/magicmint'
import { PublicKey } from '@solana/web3.js'
import { program } from '@/app/utils/setup'
import 'server-only'

export async function getOustandingAirdrops(mint: string) {
	const { nonce, count } = await fetchAirdropState({ program, mint: new PublicKey(mint) })

	return nonce - count
}

export const dynamic = 'force-dynamic'
