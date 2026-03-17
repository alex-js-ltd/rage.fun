import { coerceFormValue } from '@conform-to/zod/v3/future'
import { memoize } from '@conform-to/react/future'
import { z } from 'zod'
import { PublicKey } from '@solana/web3.js'

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

export const SearchParamsSchema = z.object({
	sortType: z.enum(['createdAt', 'lastTrade', 'marketCap', 'volume']).default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
	cursorId: z.string().optional(),
	search: z.string().optional(),
	creatorId: z.string().optional(),
})

export type SearchParams = z.infer<typeof SearchParamsSchema>

export const HarvestYieldSchema = coerceFormValue(
	z.object({
		creator: Wallet,
		mint: Mint,
	}),
)

export const AuthSchema = coerceFormValue(
	z.object({
		domain: z.string(),
		publicKey: z.string(),
		statement: z.string(),
		nonce: z.string(),
		signature: z.string(),
	}),
)

// Basic signup schema (without async validation)
export const CreateTokenSchema = coerceFormValue(
	z.object({
		creator: Wallet,
		name: z.string(),
		symbol: z
			.string({ required_error: 'Required' })
			.max(11, { message: 'Symbol is too long' })
			.min(2, { message: 'Symbol is too short' }),

		description: z.string(),

		image: z.string(),
	}),
)

// Schema creator with async validation
export function createTokenSchema(checks: { isSymbolUnique: (symbol: string) => Promise<boolean> }) {
	const isSymbolUnique = memoize(checks.isSymbolUnique)

	return coerceFormValue(
		z.object({
			creator: Wallet,

			symbol: z
				.string({ required_error: 'Required' })
				.transform(val => `$${val.trim().toUpperCase()}`)
				.refine(symbol => isSymbolUnique(symbol), {
					message: 'Symbol is already used',
				}),
			name: z.string({ required_error: 'Required' }),
			description: z.string({ required_error: 'Required' }),
			image: z.string({ required_error: 'Required' }),
		}),
	)
}

export const ReplySchema = coerceFormValue(
	z.object({
		publicKey: Wallet,
		content: z.string().max(280, 'Comment cannot exceed 280 characters'),
		mint: Mint,
		parentCommentId: z.string().optional(),
	}),
)

export const SwapSchema = coerceFormValue(
	z.object({
		payer: Wallet,
		mint: Mint,
		amount: z.string(),
		decimals: z
			.number({
				invalid_type_error: 'Expected Number',
			})
			.max(9, { message: 'Decimal is too high' })
			.min(2, { message: 'Decimal is too low' }),
	}),
)

export const WasmSchema = z.object({
	uiAmount: z.string(),

	virtualReserve: z.string(),
	currentReserve: z.string(),
	targetReserve: z.string(),

	virtualSupply: z.string(),
	currentSupply: z.string(),
	targetSupply: z.string(),

	connectorWeight: z.number(),
	decimals: z.number(),
})

export type WasmType = z.infer<typeof WasmSchema>

export const SwapOptionSchema = z.object({
	mint: Mint,
	percent: z.number(),
})

export const TokenSearchParamsSchema = z
	.object({
		interval: z.enum(['1s', '15s', '30s', '1m', '5m', '15m', '30m', '1h', '4h', '6h', '12h', '24h']),
	})
	.transform(data => {
		switch (data.interval) {
			case '1s':
				return { interval: 1 }
			case '15s':
				return { interval: 15 }
			case '30s':
				return { interval: 30 }

			case '1m':
				return { interval: 60 }
			case '5m':
				return { interval: 300 }
			case '15m':
				return { interval: 900 }
			case '30m':
				return { interval: 1800 }

			case '1h':
				return { interval: 3600 }
			case '4h':
				return { interval: 14400 }
			case '6h':
				return { interval: 21600 }
			case '12h':
				return { interval: 43200 }
			case '24h':
				return { interval: 86400 }

			default:
				return { interval: 300 } // fallback to 5m
		}
	})
