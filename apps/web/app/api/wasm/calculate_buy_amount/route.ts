import { NextRequest, NextResponse } from 'next/server'
import { parseWithZod } from '@conform-to/zod'
import { WasmSchema } from '@/app/utils/schemas'
import { fetchBondingCurveState, fromLamports, uiAmountToAmount } from '@repo/rage'
import { program } from '@/app/utils/setup'
import { formatCompactNumber } from '@/app/utils/misc'
import { BN } from '@coral-xyz/anchor'

import type * as calculateWasmModule from '../../../../calculate.wasm'
// @ts-ignore
import calculateWasm from '../../../../calculate.wasm?module'

const module$ = WebAssembly.instantiate(calculateWasm)

export const runtime = 'edge'

export async function POST(req: NextRequest) {
	const instance = (await module$) as any
	const exports = instance.exports as typeof calculateWasmModule
	const { calculate_buy_amount, ui_amount_to_amount } = exports

	const body = await req.json()

	const parsed = WasmSchema.transform(data => {
		const { connectorWeight, decimals } = data

		const uiAmount = Number(data.uiAmount)

		const lamports = ui_amount_to_amount(uiAmount, 9)

		const virtualReserve = BigInt(data.virtualReserve)
		const currentReserve = BigInt(data.currentReserve)
		const targetReserve = BigInt(data.targetReserve)

		const virtualSupply = BigInt(data.virtualSupply)
		const currentSupply = BigInt(data.currentSupply)
		const targetSupply = BigInt(data.targetSupply)

		return {
			lamports,
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

	const { lamports, ...bondingCurve } = parsed.data

	const tradingFee = calculateTradingFee(lamports)

	const depositAmount = lamports - tradingFee

	const maxDeposit = bondingCurve.targetReserve - bondingCurve.currentReserve

	const safeDeposit = depositAmount > maxDeposit ? maxDeposit : depositAmount

	const buyAmount = calculate_buy_amount(
		bondingCurve.currentSupply + bondingCurve.virtualSupply,
		safeDeposit,
		bondingCurve.currentReserve + bondingCurve.virtualReserve,
		bondingCurve.decimals,
		bondingCurve.connectorWeight,
	)

	const maxMint = bondingCurve.targetSupply - bondingCurve.currentSupply

	const tokenAmount = buyAmount > maxMint ? maxMint : buyAmount

	// Return a success response
	return NextResponse.json(tokenAmount.toString(), { status: 200 })
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
