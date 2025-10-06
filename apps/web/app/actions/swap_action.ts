'use server'

import { SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { SwapSchema } from '@/app/utils/schemas'
import { program, connection } from '@/app/utils/setup'
import { getBuyTokenIx, getSellTokenIx, buildTransaction, uiAmountToAmount } from '@repo/rage'

import { auth } from '@/app/auth'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

import { getAssociatedTokenAddress, getAccount, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

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

	const balance = await connection.getBalance(payer)

	if (balance < uiAmountToAmount(amount, 9).toNumber()) {
		return {
			...submission.reply(),
			serializedTx: undefined,
		}
	}
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

	const token0SignerAta = await getAssociatedTokenAddress(mint, payer, true, TOKEN_2022_PROGRAM_ID)

	const info = await connection.getAccountInfo(token0SignerAta, 'confirmed')

	if (!info) {
		return {
			...submission.reply(),
			serializedTx: undefined,
		}
	}

	const account = await getAccount(connection, token0SignerAta, 'confirmed', TOKEN_2022_PROGRAM_ID)

	const full = account.amount

	if (full < uiAmountToAmount(amount, decimals).toNumber()) {
		return {
			...submission.reply(),
			serializedTx: undefined,
		}
	}

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
