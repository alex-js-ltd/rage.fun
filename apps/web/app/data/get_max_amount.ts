'use server'

import { getAssociatedTokenAddress, getAccount, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, Connection } from '@solana/web3.js'
import { connection } from '@/app/utils/setup'
import { fromLamports } from '@repo/rage'
import { BN } from '@coral-xyz/anchor'
import { getDecimals } from './get_decimals'

export async function getMaxAmount(mint: string, owner: string) {
	const ata = await getAssociatedTokenAddress(new PublicKey(mint), new PublicKey(owner), true, TOKEN_2022_PROGRAM_ID)

	console.log(ata)
	const tokenAccount = await getAccount(connection, ata, 'confirmed', TOKEN_2022_PROGRAM_ID)
	console.log(tokenAccount)
	const amount = tokenAccount.amount

	const decimals = await getDecimals(mint)

	const uiAmount = fromLamports(new BN(amount.toString()), decimals)

	return uiAmount.toString()
}
