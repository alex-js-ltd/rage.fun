'use server'

import { SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { HarvestYieldSchema } from '@/app/utils/schemas'
import { program, connection } from '@/app/utils/setup'
import { getHarvestYieldIx, buildTransaction } from '@repo/magicmint'

import { auth } from '@/app/auth'

import { PublicKey } from '@solana/web3.js'

export type State =
	| (SubmissionResult<string[]> & {
			serializedTx?: Uint8Array
	  })
	| undefined

export async function harvestYieldAction(_prevState: State, formData: FormData) {
	const session = await auth()

	const submission = parseWithZod(formData, {
		schema: HarvestYieldSchema,
	})

	if (submission.status !== 'success' || !session?.user?.id) {
		return {
			...submission.reply(),
			serializedTx: undefined,
		}
	}

	const { creator, mint } = submission.value

	const payer = new PublicKey(session?.user?.id)

	const ix = await getHarvestYieldIx({
		program,
		creator,
		mint,
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
