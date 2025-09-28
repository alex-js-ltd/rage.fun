import { NextRequest, NextResponse } from 'next/server'
import { SwapOptionSchema } from '@/app/utils/schemas'
import { parseWithZod } from '@conform-to/zod'
import { connection } from '@/app/utils/setup'
import { BN } from '@coral-xyz/anchor'
import { fromLamports } from '@repo/rage'
import { getAccount, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { getDecimals } from '@/app/data/get_decimals'

import 'server-only'

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams

	const submission = parseWithZod(searchParams, {
		schema: SwapOptionSchema,
	})

	if (submission.status !== 'success') {
		return NextResponse.json(submission.reply(), { status: 404 })
	}

	const { percent, signer, mint } = submission.value

	const token0SignerAta = await getAssociatedTokenAddress(mint, signer, true, TOKEN_2022_PROGRAM_ID)

	const info = await connection.getAccountInfo(token0SignerAta, 'confirmed')

	if (!info) {
		const zero = 0

		return NextResponse.json(
			{
				zero,
			},
			{ status: 200 },
		)
	}

	const account = await getAccount(connection, token0SignerAta, 'confirmed', TOKEN_2022_PROGRAM_ID)

	const full = account.amount

	const amount = takePercentage(new BN(full.toString()), percent)

	const decimals = await getDecimals(mint.toBase58())

	const result = fromLamports(amount, decimals).toFixed(decimals)

	return NextResponse.json(
		{
			result,
		},
		{ status: 200 },
	)
}

function takePercentage(balance: BN, percent: number): BN {
	return balance.mul(new BN(percent)).div(new BN(100))
}
