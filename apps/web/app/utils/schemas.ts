import type { Intent } from '@conform-to/react'
import { conformZodMessage } from '@conform-to/zod'
import { z } from 'zod'
import { PublicKey } from '@solana/web3.js'
import { Decimal as _Decimal } from 'decimal.js'
import { Prisma, $Enums } from '@prisma/client'

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
		.max(11, { message: 'Symbol is too long' })
		.min(2, { message: 'Symbol is too short' }),

	description: z.string(),

	image: z.string(),
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
				.transform(val => `$${val.trim().toUpperCase()}`)

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

				description: z.string(),

				image: z.string(),
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
	sortType: z.enum(['createdAt', 'lastTrade', 'marketCap', 'volume']),
	sortOrder: z.enum(['asc', 'desc']),
	cursorId: z.string().optional(),
	search: z.string().optional(),
	creatorId: z.string().optional(),
})

export type SearchParams = z.infer<typeof SearchSchema>

export const HeliusSchema = z.array(
	z.object({
		signature: z.string(),
	}),
)

export const AuthSchema = z.object({
	domain: z.string(),
	publicKey: z.string(),
	statement: z.string(),
	nonce: z.string(),
	signature: z.string(),
})

export const ReplySchema = z.object({
	publicKey: Wallet,
	content: z.string().max(280, 'Comment cannot exceed 280 characters'),
	mint: Mint,
	parentCommentId: z.string().optional(),
})

export const HarvestYieldSchema = z.object({
	creator: Wallet,
	mint: Mint,
})

export const UpdateEnumSchema = z.enum(['Buy', 'Sell', 'Create', 'Harvest'])

export type UpdateEnumType = z.infer<typeof UpdateEnumSchema>

export const SwapEventSchema = z.object({
	id: z.string(),
	signer: z.string(),
	time: z.bigint().transform(val => val.toString()),
	price: z.instanceof(Prisma.Decimal).transform(p => p.toNumber()),
	tokenAmount: z.bigint().transform(val => val.toString()),
	swapType: z.nativeEnum($Enums.SwapType),

	lamports: z.bigint().transform(val => val.toString()),

	rentAmount: z.bigint().transform(val => val.toString()),

	tokenId: z.string(),
})

export type SwapEventType = z.infer<typeof SwapEventSchema>

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
