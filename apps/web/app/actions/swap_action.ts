'use server'

import { SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { SwapSchema } from '@/app/utils/schemas'
import { program, connection } from '@/app/utils/setup'
import { getBuyTokenIx, getSellTokenIx, buildTransaction } from '@repo/rage'

import { auth } from '@/app/auth'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

export type State =
	| (SubmissionResult<string[]> & {
			serializedTx?: Uint8Array
	  })
	| undefined

export async function buyAction(_prevState: State, formData: FormData) {
	const session = await auth()

	const submission = parseWithZod(formData, {
		schema: SwapSchema,
	})

	if (submission.status !== 'success' || !session?.user?.id) {
		return {
			...submission.reply(),
			serializedTx: undefined,
		}
	}

	const { mint, amount, decimals } = submission.value

	const payer = new PublicKey(session?.user?.id)

	const buy = await getBuyTokenIx({
		program,
		payer,
		mint,
		uiAmount: amount,
		decimals,
		minOutput: new BN(0),
	})

	const transaction = await buildTransaction({
		connection,
		payer,
		instructions: [buy],
		signers: [],
	})

	return {
		...submission.reply(),
		serializedTx: transaction.serialize(),
	}
}

export async function sellAction(_prevState: State, formData: FormData) {
	const session = await auth()

	const submission = parseWithZod(formData, {
		schema: SwapSchema,
	})

	if (submission.status !== 'success' || !session?.user?.id) {
		return {
			...submission.reply(),
			serializedTx: undefined,
		}
	}

	const { mint, amount, decimals } = submission.value

	const payer = new PublicKey(session?.user?.id)

	const ix = await getSellTokenIx({
		program,
		payer,
		mint,
		uiAmount: amount,
		decimals,
		minOutput: new BN(0),
	})

	const transaction = await buildTransaction({
		connection,
		payer,
		instructions: [ix],
		signers: [],
	})

	return {
		...submission.reply(),
		serializedTx: transaction.serialize(),
	}
}
