import type { Intent } from '@conform-to/react'
import { conformZodMessage } from '@conform-to/zod'
import { z } from 'zod'
import { PublicKey } from '@solana/web3.js'
import Decimal, { Decimal as _Decimal } from 'decimal.js'
import { BN } from '@coral-xyz/anchor'
import { Prisma, $Enums } from '@prisma/client'
import dayjs from 'dayjs'
import { calculatePercentageDifference, catchError } from './misc'
import { fromLamports, calculatePrice, calculateMarketCap, calculateProgress } from '@repo/rage'
import { formatCompactNumber } from '@/app/utils/misc'
import { calculatePercentage } from './misc'
import { OhlcData } from 'lightweight-charts'
import { metadata } from '../layout'

const MAX_UPLOAD_SIZE = 1024 * 1024 * 1 // 1MB

const Wallet = z.preprocess(
	value => {
		try {
			if (typeof value === 'string') {
				return new PublicKey(value)
			}
		} catch {
			return undefined
		}
	},
	z.instanceof(PublicKey, { message: 'Invalid public key' }).refine(pk => PublicKey.isOnCurve(pk.toBytes()), {
		message: 'Not on the ed25519 curve',
	}),
)

const Mint = z.string().transform(val => new PublicKey(val))

// validate bonding curve schema on the client
export const InitializeSchema = z.object({
	creator: Wallet,
	name: z.string(),
	symbol: z
		.string({ required_error: 'Required' })
		.max(12, { message: 'Symbol is too long' })
		.min(2, { message: 'Symbol is too short' }),
	targetReserve: z
		.number({
			invalid_type_error: 'Expected Number',
		})
		.max(80, { message: 'Amount is too high' })
		.min(0.3, { message: 'Amount is too low' })
		.transform(t => t.toFixed(9)),

	description: z.string(),

	file: z.instanceof(File).refine(file => {
		return !file || file.size <= MAX_UPLOAD_SIZE
	}, 'File size must be less than 1MB'),
})

// validate bonding curve schema on the server
export function initializeBondingCurveSchema(
	intent: Intent | null,
	options?: {
		// isUsernameUnique is only defined on the server
		isSymbolUnique: (username: string) => Promise<boolean>
	},
) {
	return z
		.object({
			symbol: z
				.string({ required_error: 'Required' })
				.transform(val => val.toUpperCase())

				.pipe(
					z.string().superRefine((username, ctx) => {
						const isValidatingSymbol =
							intent === null || (intent.type === 'validate' && intent.payload.name === 'username')

						if (!isValidatingSymbol) {
							ctx.addIssue({
								code: 'custom',
								message: conformZodMessage.VALIDATION_SKIPPED,
							})
							return
						}

						if (typeof options?.isSymbolUnique !== 'function') {
							ctx.addIssue({
								code: 'custom',
								message: conformZodMessage.VALIDATION_UNDEFINED,
								fatal: true,
							})
							return
						}

						return options.isSymbolUnique(username).then(isUnique => {
							if (!isUnique) {
								ctx.addIssue({
									code: 'custom',
									message: 'Symbol is already used',
								})
							}
						})
					}),
				),
		})
		.and(
			z.object({
				creator: Wallet,
				name: z.string(),
				targetReserve: z
					.number({
						invalid_type_error: 'Expected Number',
					})
					.max(80, { message: 'Amount is too high' })
					.min(0.3, { message: 'Amount is too low' })
					.transform(t => t.toFixed(9)),

				description: z.string(),
				file: z.instanceof(File).refine(file => {
					return !file || file.size <= MAX_UPLOAD_SIZE
				}, 'File size must be less than 1MB'),
			}),
		)
}

export const SwapSchema = z.object({
	payer: Wallet,
	mint: Mint,
	amount: z.string(),
	decimals: z
		.number({
			invalid_type_error: 'Expected Number',
		})
		.max(9, { message: 'Decimal is too high' })
		.min(2, { message: 'Decimal is too low' }),
})

export type SwapType = z.infer<typeof SwapSchema>

export const DialectMetadataSchema = z.object({
	mint: z.string(),
})

export const DialectSwapSchema = z.object({
	mint: Mint,
	amount: z.string(),
})

export const SearchSchema = z.object({
	sortType: z.enum(['createdAt', 'updatedAt']),
	sortOrder: z.enum(['asc', 'desc']),
	cursorId: z.string().optional(),
	query: z.string().optional(),
	creatorId: z.string().optional(),
})

export type SearchParams = z.infer<typeof SearchSchema>

export const HeliusSchema = z.array(
	z.object({
		signature: z.string(),
	}),
)

export const AuthSchema = z.object({
	publicKey: Wallet,
})

export const ReplySchema = z.object({
	publicKey: Wallet,
	content: z.string().max(280, 'Comment cannot exceed 280 characters'),
	mint: Mint,
	parentCommentId: z.string().optional(),
})

export const CommentSchema = z.object({
	id: z.string(),
	parentCommentId: z.string().nullable().optional(),
	content: z.string().max(280, 'Comment cannot exceed 280 characters'),
	createdAt: z.date().transform(d => d.toISOString()),
	updatedAt: z.date().transform(d => d.toISOString()),
	ownerId: z.string(),
	tokenId: z.string(),
})

export const TokenSearchParams = z.object({
	interval: z.enum(['60000', '300000', '900000', '3600000']).transform(Number),
})

export const HarvestYieldSchema = z.object({
	creator: Wallet,
	mint: Mint,
})

export const UpdateEnumSchema = z.enum(['BUY', 'SELL', 'CREATE', 'HARVEST'])

export type UpdateEnumType = z.infer<typeof UpdateEnumSchema>

// Prisma Schemas
export const MetadataSchema = z.object({
	tokenId: z.string(),
	name: z.string(),
	symbol: z.string(),
	description: z.string(),
	image: z.string(),
	thumbhash: z.instanceof(Buffer).transform(val => Buffer.from(val).toString('base64')),
	createdAt: z.date().transform(d => d.toISOString()),
	updatedAt: z.date().transform(d => d.toISOString()),
})

export const BondingcurveSchema = z.object({
	id: z.string(),

	connectorWeight: z.instanceof(Prisma.Decimal).transform(val => val.toNumber()),
	decimals: z.number(),

	initialSupply: z.bigint().transform(val => val.toString()),
	currentSupply: z.bigint().transform(val => val.toString()),
	targetSupply: z.bigint().transform(val => val.toString()),

	initialReserve: z.bigint().transform(val => val.toString()),
	currentReserve: z.bigint().transform(val => val.toString()),
	targetReserve: z.bigint().transform(val => val.toString()),

	tradingFees: z.bigint().transform(val => val.toString()),
	openTime: z.bigint().transform(val => val.toString()),

	status: z.enum(['Funding', 'Complete', 'Migrated']),

	tokenId: z.string(),
	createdAt: z.date().transform(d => d.toISOString()),
	updatedAt: z.date().transform(d => d.toISOString()),
})

export const SwapEventSchema = z.object({
	id: z.string(),
	signer: z.string(),
	time: z.bigint().transform(val => val.toString()),
	price: z
		.custom<Prisma.Decimal>(val => val instanceof Prisma.Decimal, {
			message: 'Must be a valid Prisma.Decimal instance',
		})
		.transform(val => (val as Prisma.Decimal).toNumber()),
	tokenAmount: z.bigint().transform(val => val.toString()),
	swapType: z.nativeEnum($Enums.SwapType),

	lamports: z.bigint().transform(val => val.toString()),

	rentAmount: z.bigint().transform(val => val.toString()),

	tokenId: z.string(),
})

export async function createTokenFeedSchema(options: {
	volumePromise: Promise<string>
	transactionPromise: Promise<{
		readonly buys: number
		readonly sells: number
		readonly total: number
	}>
	solPricePromise: Promise<number>
}) {
	const [solVolume, transactionCount, solPrice] = await Promise.all([
		options.volumePromise,
		options.transactionPromise,
		options.solPricePromise,
	])

	return z
		.object({
			id: z.string(),
			metadata: MetadataSchema,
			bondingCurve: BondingcurveSchema,
			updateType: UpdateEnumSchema.optional(),
		})
		.transform(async data => {
			const { metadata, bondingCurve, updateType } = data

			const price = calculatePrice(bondingCurve)
			const marketCap = calculateMarketCap(bondingCurve)
			const liquidity = new Decimal(bondingCurve.currentReserve).div(1e9)
			const volume = new Decimal(solVolume).div(1e9)

			const metrics = {
				price: solToUsd(price, solPrice),
				marketCap: solToUsd(marketCap, solPrice),
				liquidity: solToUsd(liquidity, solPrice),
				volume: solToUsd(volume, solPrice),
				transactionCount,
			}

			return { metadata, metrics, updateType }
		})
}

export function calculatePrice(state: BondingCurveType) {
	const { currentReserve, currentSupply, connectorWeight, decimals } = state

	const reserve = new Decimal(currentReserve).div(1e9) // lamports → SOL
	const supply = new Decimal(currentSupply).div(
		new Decimal(10).pow(decimals), // base units → tokens
	)

	const cw = new Decimal(connectorWeight)

	return reserve.dividedBy(supply.mul(cw))
}

export function calculateMarketCap(state: BondingCurveType) {
	const price = calculatePrice(state)

	const supply = new Decimal(state.currentSupply.toString()).div(new Decimal(10).pow(state.decimals))

	return price.mul(supply)
}

export function solToUsd(amountInSol: Decimal, solPrice: number): Decimal {
	return amountInSol.mul(new Decimal(solPrice))
}

export function createTransactionTableSchema(options: { decimals: number; solPrice: number }) {
	return SwapEventSchema.transform(data => {
		const uiResult = fromLamports(new BN(data.tokenAmount), options.decimals)

		const uiAmount = formatCompactNumber(uiResult)

		const volumeSol = new Decimal(data.lamports).div(1e9)

		const volume = solToUsd(volumeSol, options.solPrice).toNumber()

		const price = solToUsd(new Decimal(data.price), options.solPrice).toNumber()

		const { id, time, swapType, signer, tokenId } = data

		return { id, time, swapType, price, volume, uiAmount, signer, tokenId }
	})
}

// Prisma Types
export type TokenMetadataType = z.infer<typeof MetadataSchema>

export type BondingCurveType = z.infer<typeof BondingcurveSchema>

export type SwapEventType = z.infer<typeof SwapEventSchema>

export type TokenFeedType = z.output<Awaited<ReturnType<typeof createTokenFeedSchema>>>

export type TransactionTableType = z.infer<ReturnType<typeof createTransactionTableSchema>>

export type CommentType = z.infer<typeof CommentSchema>

export const AccountSchema = z.object({
	address: z.instanceof(PublicKey).transform(a => a.toBase58()),
	owner: z.instanceof(PublicKey).transform(o => o.toBase58()),
	amount: z
		.bigint()
		.refine(a => a > BigInt('0'), { message: 'Amount must be greater than 0' })
		.transform(a => a.toString()),

	accountType: z.enum(['trader', 'bonding-curve', 'raydium-pool']),
})

export function createTopHolderSchema(decimals: number, totalSupply: BN) {
	return AccountSchema.transform(data => {
		const { owner, address, amount, accountType } = data

		const uiResult = fromLamports(new BN(amount), decimals)

		const uiAmount = formatCompactNumber(uiResult)

		const percentageOwned = calculatePercentage(new BN(amount), totalSupply, decimals).toFixed(3)

		return { owner, address, uiAmount, percentageOwned, accountType }
	})
}

export type TopHolderType = z.infer<ReturnType<typeof createTopHolderSchema>>

export const WasmSchema = z.object({
	mint: Mint,
	uiAmount: z.string(),
})

export const TokenAmountSchema = z.object({
	amount: z.string().regex(/^\d+$/, {
		message: 'Amount must be a numeric string',
	}),
	decimals: z.number().int().nonnegative(),
	uiAmount: z.number().nonnegative(),
	uiAmountString: z.string().regex(/^\d+(\.\d+)?$/, {
		message: 'uiAmountString must be a valid number string',
	}),
})

export function isOhlcData(data: unknown): data is OhlcData {
	return (
		Boolean(data) &&
		typeof data === 'object' &&
		typeof (data as OhlcData).time === 'number' &&
		typeof (data as OhlcData).open === 'number' &&
		typeof (data as OhlcData).high === 'number' &&
		typeof (data as OhlcData).low === 'number' &&
		typeof (data as OhlcData).close === 'number'
	)
}
