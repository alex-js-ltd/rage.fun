import { NextRequest, NextResponse } from 'next/server'
import { SwapOptionSchema } from '@/app/utils/schemas'
import { parseWithZod } from '@conform-to/zod'
import { getQuickBuyOptions } from '@/app/data/get_quick_buy_options'
import { getQuickSellOptions } from '@/app/data/get_quick_sell_options'

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams

	const submission = parseWithZod(searchParams, {
		schema: SwapOptionSchema,
	})

	if (submission.status !== 'success') {
		return NextResponse.json(submission.reply(), { status: 404 })
	}

	const { swapType, amount, signer, mint } = submission.value

	if (swapType === 'Buy') {
		const data = await getQuickBuyOptions(signer.toBase58())

		// Return a success response
		return NextResponse.json(
			{
				data,
			},
			{ status: 200 },
		)
	} else {
		const data = await getQuickSellOptions(mint.toBase58(), signer.toBase58())
		// Return a success response
		return NextResponse.json(
			{
				data,
			},
			{ status: 200 },
		)
	}
}
