import Decimal from 'decimal.js'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { BN } from '@coral-xyz/anchor'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

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

/**
 * Does its best to get a string error message from an unknown error.
 */
export function getErrorMessage(error: unknown) {
	if (typeof error === 'string') return error
	if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
		return `${error.message} 💩`
	}
	console.error('unable to get error message for error', error)
	return 'unexpected error'
}

export function formatTinyNumber(num: number, precision = 3): string {
	if (num === 0) return '0.0₀000'

	// force a fixed-point string so we keep the leading zeros
	const fixed = num.toFixed(precision + 12) // pad extra digits
	const [, decimals = ''] = fixed.split('.')

	// count zeros *after* the decimal
	const leadingZeros = decimals.match(/^0+/)?.[0]?.length ?? 0

	// slice the significant digits right after those zeros
	const significant = decimals.slice(leadingZeros, leadingZeros + precision)

	// build unicode subscript
	const subscript = [...leadingZeros.toString()].map(d => String.fromCharCode(0x2080 + Number(d))).join('')

	return `0.0${subscript}${significant}`
}

export function timeFromNow(time: string) {
	const millis = new BN(time).toNumber() * 1000
	const date = new Date(millis)
	return dayjs(date).fromNow()
}
