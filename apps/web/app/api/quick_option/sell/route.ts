import { NextRequest, NextResponse } from 'next/server'
import { SwapOptionSchema } from '@/app/utils/schemas'
import { BN } from '@coral-xyz/anchor'
import { fromLamports } from '@repo/rage'
import { getDecimals } from '@/app/data/get_decimals'
import { auth } from '@/app/auth'
import { PublicKey } from '@solana/web3.js'
import { takePercentage } from '@/app/utils/misc'
import { getTokenBalance } from '@/app/data/get_token_balance'

import { parseSubmission, report } from '@conform-to/react/future'

import 'server-only'

export async function GET(req: NextRequest) {
	const session = await auth()

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
	}

	const signer = new PublicKey(session.user.id)

	const searchParams = req.nextUrl.searchParams

	const submission = parseSubmission(searchParams)

	const result = SwapOptionSchema.safeParse(submission.payload)

	if (!result.success) {
		return NextResponse.json(
			{
				...report(submission, {
					error: {
						issues: result.error.issues,
					},
				}),
			},
			{ status: 404 },
		)
	}

	const { percent, mint } = result.data

	const balance = await getTokenBalance(mint, signer)

	if (!balance) {
		return NextResponse.json(
			'0',

			{ status: 200 },
		)
	}

	const amount = takePercentage(new BN(balance.toString()), percent)

	const decimals = await getDecimals(mint.toBase58())

	const res = fromLamports(amount, decimals).toFixed(decimals)

	return NextResponse.json(
		res,

		{ status: 200 },
	)
}
