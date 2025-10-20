import { cache } from 'react'
import { type TopHolderType, createTopHolderSchema } from '@/app/utils/schemas'
import { connection } from '@/app/utils/setup'
import { PublicKey, Connection } from '@solana/web3.js'
import { program } from '@/app/utils/setup'
import { TOKEN_2022_PROGRAM_ID, getAccount, getAssociatedTokenAddress } from '@solana/spl-token'
import { fetchBondingCurveState } from '@repo/rage'
import { getCreatorId } from '@/app/data/get_creator_id'
import { getServerEnv } from '@/app/utils/env'
import 'server-only'

const { RPC_URL } = getServerEnv()

export const getTopHolders = cache(async (address: string): Promise<TopHolderType[]> => {
	const connection = new Connection(RPC_URL, 'confirmed')

	const creatorId = await getCreatorId(address)

	const mint = new PublicKey(address)

	const token0CreatorAta = await getAssociatedTokenAddress(mint, new PublicKey(creatorId), true, TOKEN_2022_PROGRAM_ID)

	const accounts = await connection.getTokenLargestAccounts(mint, 'confirmed')

	const tokenAccounts = accounts.value.map(account => account)

	const { decimals, currentSupply } = await fetchBondingCurveState({ program, mint })

	const TopHolderSchema = createTopHolderSchema(decimals, currentSupply)

	const results = await Promise.allSettled(
		tokenAccounts.map(curr => getAccount(connection, curr.address, 'confirmed', TOKEN_2022_PROGRAM_ID)),
	)

	const result = results.reduce<TopHolderType[]>((acc, curr) => {
		if (curr.status === 'rejected') return acc

		const isCreator = curr.value.address.toBase58() === token0CreatorAta.toBase58()

		const parsed = TopHolderSchema.safeParse({ ...curr.value, isCreator })

		if (parsed.success) {
			acc.push(parsed.data)
		}

		// Return the updated accumulator (still a promise)
		return acc
	}, []) // Start with an already resolved empty array

	return result
})
