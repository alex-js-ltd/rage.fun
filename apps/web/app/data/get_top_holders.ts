import { cache } from 'react'

import { PublicKey, Connection } from '@solana/web3.js'
import { program } from '@/app/utils/setup'
import { TOKEN_2022_PROGRAM_ID, getAccount, getAssociatedTokenAddress } from '@solana/spl-token'
import { fetchBondingCurveState, fromLamports } from '@repo/rage'
import { getCreatorId } from '@/app/data/get_creator_id'
import { getServerEnv } from '@/app/utils/env'

import { formatCompactNumber, calculatePercentage } from '@/app/utils/misc'
import { BN } from '@coral-xyz/anchor'
import 'server-only'

const { RPC_URL } = getServerEnv()

export const getTopHolders = cache(async (address: string): Promise<TopHolder[]> => {
	const connection = new Connection(RPC_URL, 'confirmed')

	const creatorId = await getCreatorId(address)

	const mint = new PublicKey(address)

	const token0CreatorAta = await getAssociatedTokenAddress(mint, new PublicKey(creatorId), true, TOKEN_2022_PROGRAM_ID)

	const accounts = await connection.getTokenLargestAccounts(mint, 'confirmed')

	const tokenAccounts = accounts.value.map(account => account)

	const { decimals, currentSupply } = await fetchBondingCurveState({ program, mint })

	const transform = toTopHolder(decimals, currentSupply)

	const results = await Promise.allSettled(
		tokenAccounts.map(curr => getAccount(connection, curr.address, 'confirmed', TOKEN_2022_PROGRAM_ID)),
	)

	const result = results.reduce<TopHolder[]>((acc, curr) => {
		if (curr.status === 'rejected') return acc

		const isCreator = curr.value.address.toBase58() === token0CreatorAta.toBase58()

		const { address, owner, amount } = curr.value

		if (amount > BigInt('0')) {
			const topHolder = transform(address, owner, amount, isCreator)
			acc.push(topHolder)
		}

		// Return the updated accumulator (still a promise)
		return acc
	}, []) // Start with an already resolved empty array

	return result
})

function toTopHolder(decimals: number, totalSupply: BN) {
	return function (address: PublicKey, owner: PublicKey, amount: bigint, isCreator?: boolean) {
		const uiResult = fromLamports(new BN(amount), decimals)

		const uiAmount = formatCompactNumber(uiResult)

		const percentageOwned = calculatePercentage(new BN(amount), totalSupply).toFixed(3)

		return { owner: owner.toBase58(), address: address.toBase58(), uiAmount, percentageOwned, isCreator }
	}
}

export type TopHolder = ReturnType<ReturnType<typeof toTopHolder>>
