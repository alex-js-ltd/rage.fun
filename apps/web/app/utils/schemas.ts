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
