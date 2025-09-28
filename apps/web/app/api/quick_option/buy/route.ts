import { NextRequest, NextResponse } from 'next/server'
import { SwapOptionSchema } from '@/app/utils/schemas'
import { parseWithZod } from '@conform-to/zod'
import { connection } from '@/app/utils/setup'
import { BN } from '@coral-xyz/anchor'
import { fromLamports } from '@repo/rage'
import { auth } from '@/app/auth'
import { PublicKey } from '@solana/web3.js'

const TX_FEE_BUFFER = BigInt(5_000_000)

export async function GET(req: NextRequest) {
	const session = await auth()

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
	}

	const signer = new PublicKey(session.user.id)

	const searchParams = req.nextUrl.searchParams

	const submission = parseWithZod(searchParams, {
		schema: SwapOptionSchema,
	})

	if (submission.status !== 'success') {
		return NextResponse.json(submission.reply(), { status: 404 })
	}

	const { percent } = submission.value

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

	const result = fromLamports(amount, 9).toFixed(9)

	return NextResponse.json(
		result,

		{ status: 200 },
	)
}

function takePercentage(balance: BN, percent: number): BN {
	return balance.mul(new BN(percent)).div(new BN(100))
}
