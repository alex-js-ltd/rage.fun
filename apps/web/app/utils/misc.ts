import Decimal from 'decimal.js'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function calculatePercentage(current: bigint, target: bigint) {
	return new Decimal(current.toString()).div(target.toString()).mul(100).toNumber()
}

export function solToUsd(amountInSol: Decimal, solPrice: number): Decimal {
	return amountInSol.mul(new Decimal(solPrice))
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatNumberSmart(num: number): string {
	if (num === 0) return '0'

	if (num >= 0.01) {
		return num.toFixed(2) // two decimals for "normal" numbers
	}

	// fallback for ultra tiny numbers
	return num.toExponential(2) // scientific notation
}

export function shortAddress(addr: string) {
	return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

export function formatTokenAmount(bn: string) {
	const [whole] = bn.split('.') // get only the part before the decimal
	return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatCompactNumber(
	value: number,
	options?: {
		locale?: string
		maximumFractionDigits?: number
	},
): string {
	const { locale = 'en-US', maximumFractionDigits = 2 } = options ?? {}

	return new Intl.NumberFormat(locale, {
		notation: 'compact',
		compactDisplay: 'short',
		maximumFractionDigits,
	}).format(value)
}
