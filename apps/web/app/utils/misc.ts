import Decimal from 'decimal.js'

export function calculatePercentage(current: bigint, target: bigint) {
	return new Decimal(current.toString()).div(target.toString()).mul(100).toNumber()
}

export function solToUsd(amountInSol: Decimal, solPrice: number): Decimal {
	return amountInSol.mul(new Decimal(solPrice))
}
