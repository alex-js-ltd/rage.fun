import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/utils/db'
import {
	type ActionGetResponse,
	type ActionPostResponse,
	type LinkedAction,
	createPostResponse,
	ActionPostRequest,
	ACTIONS_CORS_HEADERS,
	createActionHeaders,
} from '@solana/actions'

import { PublicKey } from '@solana/web3.js'
import { program, connection } from '@/app/utils/setup'
import { buildTransaction, getBuyTokenIx } from '@repo/magicmint'
import { getBondingCurveState } from '@/app/data/get_bonding_curve_state'
import { parseWithZod } from '@conform-to/zod'
import { DialectMetadataSchema, DialectSwapSchema } from '@/app/utils/schemas'

// create the standard headers for this route (including CORS)
const headers = createActionHeaders()

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams

	const submission = parseWithZod(searchParams, {
		schema: DialectMetadataSchema,
	})

	if (submission.status !== 'success') {
		return NextResponse.json(submission.reply(), { status: 404 })
	}

	const { mint } = submission.value

	const bondingCurve = await getBondingCurveState(mint)

	if (!bondingCurve) {
		return NextResponse.json({ error: 'bonding curve not found' }, { status: 500 })
	}

	const decimals = bondingCurve.decimals

	const requestUrl = new URL(req.url)

	const baseHref = new URL(`/api/buy?mint=${mint}&decimals=${decimals}`, requestUrl.origin).toString()

	const token = await prisma.tokenMetadata.findUnique({
		where: {
			id: mint,
		},
	})

	if (!token) {
		return NextResponse.json({ error: 'failed to retrieve token metadata' }, { status: 500 })
	}

	const payload: ActionGetResponse = {
		type: 'action',
		icon: token.image,
		label: `Mint ${token.symbol} `,
		description: `${token.description}`,
		title: `magicmint.fun`,

		links: {
			actions: [
				{
					type: 'transaction',
					label: `Mint ${token.symbol}`,
					href: `${baseHref}&amount={amount}`,
					parameters: [
						{
							name: 'amount',
							label: 'SOL amount',
							required: true,
						},
					],
				},
			],
		},
	}

	return Response.json(payload, { headers })
}

export async function OPTIONS() {
	return Response.json(null, { headers })
}

export async function POST(req: NextRequest) {
	const body: ActionPostRequest = await req.json()

	const payer = new PublicKey(body.account)

	const searchParams = req.nextUrl.searchParams

	const submission = parseWithZod(searchParams, {
		schema: DialectSwapSchema,
	})

	if (submission.status !== 'success') {
		return NextResponse.json(submission.reply(), { status: 404 })
	}

	const { mint, amount, decimals } = submission.value

	const buy = await getBuyTokenIx({
		program,
		payer,
		mint,
		uiAmount: amount,
		decimals,
	})

	const transaction = await buildTransaction({
		connection,
		payer,
		instructions: [buy],
		signers: [],
	})

	const payload: ActionPostResponse = await createPostResponse({
		fields: {
			transaction,
			type: 'transaction',
		},
	})

	return NextResponse.json(payload, { headers })
}
