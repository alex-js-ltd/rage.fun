'use server'

import { SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { SwapSchema } from '@/app/utils/schemas'
import { program, connection } from '@/app/utils/setup'
import { getBuyTokenIx, getSellTokenIx, buildTransaction, uiAmountToAmount } from '@repo/rage'

import { auth } from '@/app/auth'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { isInstructionError, getErrorMessage } from '@/app/utils/setup'

import { getAssociatedTokenAddress, getAccount, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

export type State =
	| (SubmissionResult<string[]> & {
			serializedTx?: Uint8Array
			errMessage?: string
			requestId?: string
	  })
	| undefined

export async function buyAction(_prevState: State, formData: FormData) {
	const requestId = crypto.randomUUID()
	const session = await auth()

	const submission = parseWithZod(formData, {
		schema: SwapSchema,
	})

	console.log(submission)

	if (submission.status !== 'success' || !session?.user?.id) {
		return {
			...submission.reply(),
			serializedTx: undefined,
			errMessage: undefined,
			requestId,
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

	const sim = await connection.simulateTransaction(transaction)
	console.log(sim)
	if (sim.value.err !== null && !isInstructionError(sim.value.err)) {
		return {
			...submission.reply(),
			serializedTx: undefined,
			errMessage: 'unknown error',
			requestId,
		}
	} else if (sim.value.err !== null && isInstructionError(sim.value.err)) {
		const code = sim.value.err.InstructionError[1].Custom
		const errMessage = getErrorMessage(code)

		return {
			...submission.reply(),
			serializedTx: undefined,
			errMessage,
			requestId,
		}
	}

	return {
		...submission.reply(),
		serializedTx: transaction.serialize(),
		errMessage: undefined,
		requestId,
	}
}

export async function sellAction(_prevState: State, formData: FormData) {
	const requestId = crypto.randomUUID()
	const session = await auth()

	const submission = parseWithZod(formData, {
		schema: SwapSchema,
	})

	if (submission.status !== 'success' || !session?.user?.id) {
		return {
			...submission.reply(),
			serializedTx: undefined,
			errMessage: undefined,
			requestId,
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

	const sim = await connection.simulateTransaction(transaction)

	if (sim.value.err !== null && !isInstructionError(sim.value.err)) {
		return {
			...submission.reply(),
			serializedTx: undefined,
			errMessage: 'Insufficient token balance.',
			requestId,
		}
	} else if (sim.value.err !== null && isInstructionError(sim.value.err)) {
		const code = sim.value.err.InstructionError[1].Custom
		const errMessage = getErrorMessage(code)

		return {
			...submission.reply(),
			serializedTx: undefined,
			errMessage,
			requestId,
		}
	}

	return {
		...submission.reply(),
		serializedTx: transaction.serialize(),
		errMessage: undefined,
		requestId,
	}
}
