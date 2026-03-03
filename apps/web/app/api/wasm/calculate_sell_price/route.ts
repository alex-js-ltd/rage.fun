import { NextRequest, NextResponse } from 'next/server'
import { WasmSchema } from '@/app/utils/schemas'

import type * as calculateWasmModule from '../../../../calculate.wasm'
// @ts-ignore
import calculateWasm from '../../../../calculate.wasm?module'

const module$ = WebAssembly.instantiate(calculateWasm)

export async function POST(req: NextRequest) {
	const instance = (await module$) as any
	const exports = instance.exports as typeof calculateWasmModule
	const { calculate_sell_price, ui_amount_to_amount } = exports

	const body = await req.json()

	const parsed = WasmSchema.transform(data => {
		const { connectorWeight, decimals } = data

		const uiAmount = Number(data.uiAmount)

		const tokenAmount = ui_amount_to_amount(uiAmount, decimals)

		const virtualReserve = BigInt(data.virtualReserve)
		const currentReserve = BigInt(data.currentReserve)
		const targetReserve = BigInt(data.targetReserve)

		const virtualSupply = BigInt(data.virtualSupply)
		const currentSupply = BigInt(data.currentSupply)
		const targetSupply = BigInt(data.targetSupply)

		return {
			tokenAmount,
			virtualReserve,
			currentReserve,
			targetReserve,
			virtualSupply,
			currentSupply,
			targetSupply,
			connectorWeight,
			decimals,
		}
	}).safeParse(body)

	if (parsed.error) {
		return NextResponse.json(parsed.error.flatten(), { status: 404 })
	}

	const { tokenAmount, ...bondingCurve } = parsed.data

	const lamports = calculate_sell_price(
		bondingCurve.currentSupply + bondingCurve.virtualSupply,
		tokenAmount,
		bondingCurve.currentReserve + bondingCurve.virtualReserve,
		bondingCurve.decimals,
		bondingCurve.connectorWeight,
	)

	const tradingFee = calculateTradingFee(lamports)

	const sellerAmount = lamports - tradingFee

	// Return a success response
	return NextResponse.json(sellerAmount.toString(), { status: 200 })
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

// export const runtime = 'edge'
