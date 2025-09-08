import { fetchAirdropState } from '@repo/magicmint'
import { PublicKey } from '@solana/web3.js'
import { program } from '@/app/utils/setup'
import 'server-only'

export async function getAirdropState(mint: string) {
	const state = await fetchAirdropState({ program, mint: new PublicKey(mint) })

	return state
}

export const dynamic = 'force-dynamic'
