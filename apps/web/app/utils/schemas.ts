import type { Intent } from '@conform-to/react'
import { conformZodMessage } from '@conform-to/zod'
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

export const HarvestYieldSchema = z.object({
	creator: Wallet,
	mint: Mint,
})

export const AuthSchema = z.object({
	domain: z.string(),
	publicKey: z.string(),
	statement: z.string(),
	nonce: z.string(),
	signature: z.string(),
})
