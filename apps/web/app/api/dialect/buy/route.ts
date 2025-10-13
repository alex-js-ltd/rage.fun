import { type NextRequest, NextResponse } from 'next/server'
import {
	type ActionGetResponse,
	type ActionPostResponse,
	type LinkedAction,
	type ActionError,
	createPostResponse,
	ActionPostRequest,
	ACTIONS_CORS_HEADERS,
	createActionHeaders,
	BLOCKCHAIN_IDS,
} from '@solana/actions'

import { PublicKey } from '@solana/web3.js'
import { program, connection } from '@/app/utils/setup'
import { buildTransaction, getBuyTokenIx } from '@repo/rage'
import { parseWithZod } from '@conform-to/zod'
import { DialectMetadataSchema, DialectSwapSchema } from '@/app/utils/schemas'
import { getCachedTokenMetadata } from '@/app/data/get_token_metadata'
import { BN } from '@coral-xyz/anchor'
import { isInstructionError, getErrorMessage } from '@/app/utils/setup'
// CAIP-2 format for Solana
const blockchain = BLOCKCHAIN_IDS.mainnet

// Create headers with CAIP blockchain ID
const headers = {
	...ACTIONS_CORS_HEADERS,
	'x-blockchain-ids': blockchain,
	'x-action-version': '2.4',
}

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams

	const submission = parseWithZod(searchParams, {
		schema: DialectMetadataSchema,
	})

	if (submission.status !== 'success') {
		return NextResponse.json(submission.reply(), { status: 404 })
	}

	const { mint } = submission.value

	const requestUrl = new URL(req.url)

	const baseHref = new URL(`/api/dialect/buy?mint=${mint}`, requestUrl.origin).toString()

	const token = await getCachedTokenMetadata(mint)

	if (!token) {
		return NextResponse.json({ error: 'failed to retrieve token metadata' }, { status: 500 })
	}

	const payload: ActionGetResponse = {
		type: 'action',
		icon: token.image,
		label: `Buy ${token.symbol}`,
		description: `${token.description}`,
		title: `letsrage.fun`,

		links: {
			actions: [
				{
					type: 'transaction',
					label: `Buy ${token.symbol}`,
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

	const { mint, amount } = submission.value

	const decimals = 9

	try {
		const buy = await getBuyTokenIx({
			program,
			payer,
			mint,
			uiAmount: amount,
			decimals,
			minOutput: new BN(0),
		})

		const transaction = await buildTransaction({
			connection,
			payer,
			instructions: [buy],
			signers: [],
		})

		const sim = await connection.simulateTransaction(transaction)

		// EARLY THROW on simulation error
		if (sim.value.err && isInstructionError(sim.value.err)) {
			const code = sim.value.err.InstructionError[1].Custom
			const message = getErrorMessage(code)

			// Wrap message in an ActionError object so it can be shown in the Blink UI
			const errorResponse: ActionError = {
				message,
			}

			return new Response(JSON.stringify(errorResponse), {
				status: 500,
				headers,
			})
		}

		const payload: ActionPostResponse = await createPostResponse({
			fields: {
				transaction,
				type: 'transaction',
			},
		})

		return NextResponse.json(payload, { headers })
	} catch (error) {
		// Log and return an error response
		console.error('Error processing request:', error)

		// Error message
		const message = error instanceof Error ? error.message : 'Internal server error'

		// Wrap message in an ActionError object so it can be shown in the Blink UI
		const errorResponse: ActionError = {
			message,
		}

		return new Response(JSON.stringify(errorResponse), {
			status: 500,
			headers,
		})
	}
}
