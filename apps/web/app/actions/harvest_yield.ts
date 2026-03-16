'use server'

import { parseSubmission, report } from '@conform-to/react/future'
import { HarvestYieldSchema } from '@/app/utils/schemas'
import { program, connection } from '@/app/utils/setup'
import { getHarvestYieldIx, buildTransaction } from '@repo/rage'

import { auth } from '@/app/auth'
import { isInstructionError, getErrorMessage } from '@/app/utils/setup'

export async function harvestYield(_prevState: unknown, formData: FormData) {
	const requestId = crypto.randomUUID()
	const session = await auth()

	const submission = parseSubmission(formData)
	const result = HarvestYieldSchema.safeParse(submission.payload)

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

	const { creator, mint } = result.data

	const payer = creator

	const ix = await getHarvestYieldIx({
		program,
		creator,
		mint,
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
			errMessage: 'Insufficient balance',
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
