import { NextRequest, NextResponse } from 'next/server'
import { parseWithZod } from '@conform-to/zod'
import { WasmSchema } from '@/app/utils/schemas'
import { fetchBondingCurveState, fromLamports, uiAmountToAmount } from '@repo/magicmint'
import { program } from '@/app/utils/setup'
import { BN } from '@coral-xyz/anchor'

import type * as calculateWasmModule from '../../../../calculate.wasm'
// @ts-ignore
import calculateWasm from '../../../../calculate.wasm?module'

const module$ = WebAssembly.instantiate(calculateWasm)

export const runtime = 'edge'

export async function GET(req: NextRequest) {
	const instance = (await module$) as any
	const exports = instance.exports as typeof calculateWasmModule
	const { calculate_sell_price } = exports

	const searchParams = req.nextUrl.searchParams

	const submission = parseWithZod(searchParams, {
		schema: WasmSchema,
	})

	if (submission.status !== 'success') {
		return NextResponse.json(submission.reply(), { status: 404 })
	}

	const { mint, uiAmount } = submission.value

	const bondingCurve = await fetchBondingCurveState({ mint, program })

	const supply = BigInt(bondingCurve.totalSupply.toString())
	const tokenAmount = BigInt(uiAmountToAmount(uiAmount, bondingCurve.decimals).toString())
	const connectorBalance = BigInt(bondingCurve.reserveBalance.toString())

	const lamports = calculate_sell_price(
		supply,
		tokenAmount,
		connectorBalance,
		bondingCurve.decimals,
		bondingCurve.connectorWeight,
	)

	const tradingFee = calculateTradingFee(lamports)

	const sellerAmount = lamports - tradingFee

	const output = fromLamports(new BN(sellerAmount.toString()), 9)

	const data = output.toFixed(9)

	// Return a success response
	return NextResponse.json(data, { status: 200 })
}

/**
 * Fixed-point trading fee calculation with ceiling division
 * @param amount The token amount (lamports)
 * @param numerator Fee numerator (e.g., 10_000 for 1%)
 * @param denominator Fee denominator (e.g., 1_000_000)
 */
function calculateTradingFee(
	amount: bigint,
	numerator: bigint = BigInt(10_000),
	denominator: bigint = BigInt(1_000_000),
): bigint {
	const product = amount * numerator
	const fee = (product + denominator - BigInt(1)) / denominator // ceiling div
	return fee
}
