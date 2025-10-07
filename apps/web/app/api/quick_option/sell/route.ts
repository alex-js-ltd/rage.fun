import { NextRequest, NextResponse } from 'next/server'
import { SwapOptionSchema } from '@/app/utils/schemas'
import { parseWithZod } from '@conform-to/zod'
import { connection } from '@/app/utils/setup'
import { BN } from '@coral-xyz/anchor'
import { fromLamports } from '@repo/rage'
import { getAccount, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { getDecimals } from '@/app/data/get_decimals'
import { auth } from '@/app/auth'
import { PublicKey } from '@solana/web3.js'
import { takePercentage } from '@/app/utils/misc'
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

	const token0SignerAta = await getAssociatedTokenAddress(mint, signer, true, TOKEN_2022_PROGRAM_ID)

	const info = await connection.getAccountInfo(token0SignerAta, 'confirmed')

	if (!info) {
		return NextResponse.json(
			'0',

			{ status: 200 },
		)
	}

	const account = await getAccount(connection, token0SignerAta, 'confirmed', TOKEN_2022_PROGRAM_ID)

	const full = account.amount

	const amount = takePercentage(new BN(full.toString()), percent)

	const decimals = await getDecimals(mint.toBase58())

	const result = fromLamports(amount, decimals).toFixed(decimals)

	return NextResponse.json(
		result,

		{ status: 200 },
	)
}
