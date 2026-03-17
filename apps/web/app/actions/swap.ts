'use server'
import { parseSubmission, report } from '@conform-to/react/future'
import { SwapSchema } from '@/app/utils/schemas'
import { program, connection, isInstructionError, getErrorMessage } from '@/app/utils/setup'
import { getBuyTokenIx, getSellTokenIx, buildTransaction } from '@repo/rage'
import { auth } from '@/app/auth'
import { BN } from '@coral-xyz/anchor'

export async function buy(_prevState: unknown, formData: FormData) {
	const requestId = crypto.randomUUID()
	const session = await auth()

	if (!session) {
		return null
	}

	const submission = parseSubmission(formData)

	const result = SwapSchema.safeParse(submission.payload)

	if (!result.success) {
		return {
			...report(submission, {
				error: {
					issues: result.error.issues,
				},
			}),
			serializedTx: undefined,
			errMessage: undefined,
			requestId,
		}
	}

	const { mint, amount, decimals, payer } = result.data

	const buy = await getBuyTokenIx({
		program,
		payer,
		mint,
		uiAmount: amount,
		decimals,
		minOutput: new BN(0),
	})

	const tx = await buildTransaction({
		connection,
		payer,
		instructions: [buy],
		signers: [],
	})

	const sim = await connection.simulateTransaction(tx)

	if (sim.value.err !== null && !isInstructionError(sim.value.err)) {
		return {
			...report(submission, {
				reset: true,
			}),
			serializedTx: undefined,
			errMessage: 'Unkown error',
			requestId,
		}
	} else if (sim.value.err !== null && isInstructionError(sim.value.err)) {
		const code = sim.value.err.InstructionError[1].Custom
		const errMessage = getErrorMessage(code)

		return {
			...report(submission, {
				reset: true,
			}),
			serializedTx: undefined,
			errMessage,
			requestId,
		}
	}

	return {
		...report(submission, { reset: true }),
		serializedTx: tx.serialize(),
		errMessage: undefined,
		requestId,
	}
}

export async function sell(_prevState: unknown, formData: FormData) {
	const requestId = crypto.randomUUID()
	const session = await auth()

	if (!session) {
		return null
	}

	const submission = parseSubmission(formData)

	const result = SwapSchema.safeParse(submission.payload)

	if (!result.success) {
		return {
			...report(submission, {
				error: {
					issues: result.error.issues,
				},
			}),
			serializedTx: undefined,
			errMessage: undefined,
			requestId,
		}
	}

	const { mint, amount, decimals, payer } = result.data

	const ix = await getSellTokenIx({
		program,
		payer,
		mint,
		uiAmount: amount,
		decimals,
		minOutput: new BN(0),
	})

	const tx = await buildTransaction({
		connection,
		payer,
		instructions: [ix],
		signers: [],
	})

	const sim = await connection.simulateTransaction(tx)

	if (sim.value.err !== null && !isInstructionError(sim.value.err)) {
		return {
			...report(submission, {
				reset: true,
			}),
			serializedTx: undefined,
			errMessage: 'Unkown error',
			requestId,
		}
	} else if (sim.value.err !== null && isInstructionError(sim.value.err)) {
		const code = sim.value.err.InstructionError[1].Custom
		const errMessage = getErrorMessage(code)

		return {
			...report(submission, {
				reset: true,
			}),
			serializedTx: undefined,
			errMessage,
			requestId,
		}
	}

	return {
		...report(submission, { reset: true }),
		serializedTx: tx.serialize(),
		errMessage: undefined,
		requestId,
	}
}
