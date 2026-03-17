import { getAccount, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { connection } from '@/app/utils/setup'
import 'server-only'

export async function getTokenBalance(mint: PublicKey, signer: PublicKey) {
	const token0SignerAta = await getAssociatedTokenAddress(mint, signer, true, TOKEN_2022_PROGRAM_ID)

	const info = await connection.getAccountInfo(token0SignerAta, 'confirmed')

	if (!info) {
		console.error('no token account')
		return null
	}

	const account = await getAccount(connection, token0SignerAta, 'confirmed', TOKEN_2022_PROGRAM_ID)

	const full = account.amount

	return full
}
