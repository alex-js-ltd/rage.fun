import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Keypair } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import Decimal from 'decimal.js'
import { Prisma } from '@prisma/client'

dayjs.extend(relativeTime)

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
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

/**
 * Provide a condition and if that condition is falsey, this throws a 400
 * Response with the given message.
 *
 * inspired by invariant from 'tiny-invariant'
 *
 * @example
 * invariantResponse(typeof value === 'string', `value must be a string`)
 *
 * @param condition The condition to check
 * @param message The message to throw
 * @param responseInit Additional response init options if a response is thrown
 *
 * @throws {Response} if condition is falsey
 */
export function invariantResponse(
	condition: any,
	message?: string | (() => string),
	responseInit?: ResponseInit,
): asserts condition {
	if (!condition) {
		throw new Response(
			typeof message === 'function'
				? message()
				: message || 'An invariant failed, please provide a message to explain why.',
			{ status: 400, ...responseInit },
		)
	}
}

export function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export function callAll<Args extends Array<unknown>>(...fns: Array<((...args: Args) => unknown) | undefined>) {
	return (...args: Args) => fns.forEach(fn => fn?.(...args))
}

interface Error {
	message: string
}

export function isError(error: unknown): error is Error {
	return Boolean(error) && typeof error === 'object' && typeof (error as Error).message === 'string'
}

export function catchError(error: unknown): Error {
	return { message: getErrorMessage(error) }
}

export function isString(value: unknown) {
	return typeof value === 'string'
}

export function typedBoolean<T>(value: T): value is Exclude<T, '' | 0 | false | null | undefined> {
	return Boolean(value)
}

export function timeAgo(date: Date): string {
	return dayjs(date).fromNow()
}

export function formatTokenAmount(bn: string) {
	const [whole] = bn.split('.') // get only the part before the decimal
	return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function getSigner(privateKey: string): Keypair {
	const secretKeyArray = JSON.parse(privateKey)

	// Convert the array into a Uint8Array:
	const secretKeyUint8Array = new Uint8Array(secretKeyArray)

	// Create the keypair using the secret key:
	const keypair = Keypair.fromSecretKey(secretKeyUint8Array)

	return keypair
}

// Calculate percentage helper (no null checks needed)
export function calculatePercentage(numerator: BN, denominator: BN, decimals: number = 0): number {
	const precisionAdjust = new BN(10).pow(new BN(decimals))
	const scaledNumerator = numerator.mul(new BN(100)).mul(precisionAdjust)
	return scaledNumerator.div(denominator).toNumber() / 10 ** decimals
}

export function shortAddress(addr: string) {
	return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

export function calculatePercentageDifference(
	a: Prisma.Decimal | number | string,
	b: Prisma.Decimal | number | string,
	decimalPlaces: number = 3,
): number {
	const decimalA = new Decimal(a)
	const decimalB = new Decimal(b)

	const percentage = decimalB.minus(decimalA).dividedBy(decimalA).times(100)

	return parseFloat(percentage.toDecimalPlaces(decimalPlaces).toString())
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

const ogUsers = {
	dumb: '4VzJUYhiaFMQg9JsbXh1vMFSEssxRDPKqcEhvumvcVRu',
	parth: '4MH6i4A4XhRnGWm2cpsxKCXdzEQVrHfz1XdY5R4WoVWj',
	dark: '7WnwbJqp2qF6Wq3GJYNvre3S32uun6yHhGdF52bYnG3Z',
	gabzy: 'BEt8TEg6knnGE5isfpxeNq7sjaCvxaqD7jATWed3qsus',
	abel: 'Gh9GJTfeWDY7VKUWgGCihPojHVdWAqFHBGpU8pE8q3o8',
	fmzly: 'BiJ2T2g6zZT5FcdeVtbQfn84psPLUUU1bi6Tdbcg8P1S',
	dev: '7uLrYhhoJX8bT1iLL7kr6WNW7WKuV2qRVDtwPSdNPbKJ',
	kyrox: '4xZ86p5cTt2NXsfhk2tyBcK53yvh6ethySH1Ksqfcqn4',
	me: '8jCcTyypwWUmYPsQZLT2qK3tuhvWzpU9Se4v8yadKJcv',
}

export function getOgUsers() {
	return Object.values(ogUsers)
}

export function isOgUser(user: string): boolean {
	return Object.values(ogUsers).includes(user)
}

export function timeFromNow(time: string) {
	const millis = new BN(time).toNumber() * 1000
	const date = new Date(millis)
	return dayjs(date).fromNow()
}

export function formatNumberSmart(num: number): string {
	if (num === 0) return '0'

	if (num >= 0.01) {
		return num.toFixed(2) // two decimals for "normal" numbers
	}

	// fallback for ultra tiny numbers
	return num.toExponential(2) // scientific notation
}

const PERCENTAGE_SCALE = new BN(1_000_000_000) // 10^9

export function takePercentage(balance: BN, percent: number): BN {
	// Convert the percent (which can be a float) to a scaled integer
	const scaledPercent = new BN(Math.round(percent * 1_000_000_000)) // keep 9 decimals
	return balance.mul(scaledPercent).div(PERCENTAGE_SCALE.mul(new BN(100)))
}

export function solToUsd(amountInSol: Decimal, solPrice: number): Decimal {
	return amountInSol.mul(new Decimal(solPrice))
}
