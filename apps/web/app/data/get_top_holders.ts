import { type TopHolderType, createTopHolderSchema } from '@/app/utils/schemas'
import { connection } from '@/app/utils/setup'
import { PublicKey } from '@solana/web3.js'
import { getBondingCurveAuth } from '@repo/rage'
import { program } from '@/app/utils/setup'
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddress, getAccount } from '@solana/spl-token'
import { fetchBondingCurveState } from '@repo/rage'
import 'server-only'

export async function getTopHolders(address: string): Promise<TopHolderType[]> {
	const mint = new PublicKey(address)
	const bondingCurveAuth = getBondingCurveAuth({ program, mint })

	const token0BondingCurveAta = await getAssociatedTokenAddress(mint, bondingCurveAuth, true, TOKEN_2022_PROGRAM_ID)

	const accounts = await connection.getTokenLargestAccounts(mint, 'confirmed')

	const tokenAccounts = accounts.value.map(account => account)

	const { decimals, currentSupply } = await fetchBondingCurveState({ program, mint })

	const TopHolderSchema = createTopHolderSchema(decimals, currentSupply)

	const accountData = await Promise.all(
		tokenAccounts.map(curr => getAccount(connection, curr.address, 'confirmed', TOKEN_2022_PROGRAM_ID)),
	)

	const result = accountData.reduce<TopHolderType[]>((acc, curr) => {
		const ata = curr.address.toBase58()

		const accountType = ata === token0BondingCurveAta.toBase58() ? 'bonding-curve' : 'trader'

		const parsed = TopHolderSchema.safeParse({ ...curr, accountType })

		if (parsed.success) {
			acc.push(parsed.data)
		}

		// Return the updated accumulator (still a promise)
		return acc
	}, []) // Start with an already resolved empty array

	return result
}
