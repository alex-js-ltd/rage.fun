'use server'

import { SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { RandomAirdropSchema } from '@/app/utils/schemas'
import { program, connection } from '@/app/utils/setup'
import {
	getBuyTokenIx,
	getSellTokenIx,
	buildTransaction,
	getRandomAirdropIxs,
	uiAmountToAmount,
	getAccountsToAirdrop,
} from '@repo/magicmint'

import { auth } from '@/app/auth'

import { getDecimals } from '@/app/data/get_decimals'
import { PublicKey } from '@solana/web3.js'

import { getOgUsers } from '@/app/utils/misc'

export type State =
	| (SubmissionResult<string[]> & {
			serializedTx?: Uint8Array
	  })
	| undefined

export async function randomAirdropAction(_prevState: State, formData: FormData) {
	const submission = parseWithZod(formData, {
		schema: RandomAirdropSchema,
	})

	if (submission.status !== 'success') {
		return {
			...submission.reply(),
			serializedTx: undefined,
		}
	}

	const { payer, mint, users: accounts, amount: uiAmount } = submission.value

	const decimals = await getDecimals(mint.toBase58())

	const users = getAccountsToAirdrop({ accounts, mint })

	const ixs = await getRandomAirdropIxs({
		program,
		payer,
		mint,
		uiAmount,
		decimals,
		users,
	})

	const transaction = await buildTransaction({
		connection,
		payer,
		instructions: [...ixs],
		signers: [],
	})

	return {
		...submission.reply(),
		serializedTx: transaction.serialize(),
	}
}
