import { NextRequest, NextResponse } from 'next/server'
import { SwapOptionSchema } from '@/app/utils/schemas'
import { connection } from '@/app/utils/setup'
import { BN } from '@coral-xyz/anchor'
import { fromLamports } from '@repo/rage'
import { auth } from '@/app/auth'
import { PublicKey } from '@solana/web3.js'
import { takePercentage } from '@/app/utils/misc'
import { parseSubmission, report } from '@conform-to/react/future'
const TX_FEE_BUFFER = BigInt(5_000_000)

export async function GET(req: NextRequest) {
	console.log(req)
	const session = await auth()

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
	}

	const signer = new PublicKey(session.user.id)

	const searchParams = req.nextUrl.searchParams

	const submission = parseSubmission(searchParams)

	const result = SwapOptionSchema.safeParse(submission.payload)
	console.log(result.error)
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

	const { percent } = result.data

	const lamports = await connection.getBalance(signer, 'confirmed')

	const balance = BigInt(lamports)
	// Subtract buffer so we never overspend
	const effective = balance > TX_FEE_BUFFER ? balance - TX_FEE_BUFFER : BigInt(0)

	if (effective < BigInt(100)) {
		return NextResponse.json(
			'0',

			{ status: 200 },
		)
	}

	const amount = takePercentage(new BN(effective.toString()), percent)

	const res = fromLamports(amount, 9).toFixed(9)

	return NextResponse.json(
		res,

		{ status: 200 },
	)
}
