import { NextRequest, NextResponse } from 'next/server'
import { SwapOptionSchema } from '@/app/utils/schemas'
import { parseWithZod } from '@conform-to/zod'
import { BN } from '@coral-xyz/anchor'
import { fromLamports } from '@repo/rage'
import { getDecimals } from '@/app/data/get_decimals'
import { auth } from '@/app/auth'
import { PublicKey } from '@solana/web3.js'
import { takePercentage } from '@/app/utils/misc'
import { getTokenBalance } from '@/app/data/get_token_balance'
import 'server-only'

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

	const { percent, mint } = submission.value

	const balance = await getTokenBalance(mint, signer)

	if (!balance) {
		return NextResponse.json(
			'0',

			{ status: 200 },
		)
	}

	const amount = takePercentage(new BN(balance.toString()), percent)

	const decimals = await getDecimals(mint.toBase58())

	const result = fromLamports(amount, decimals).toFixed(decimals)

	return NextResponse.json(
		result,

		{ status: 200 },
	)
}
