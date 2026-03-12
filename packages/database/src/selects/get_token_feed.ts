import { type Prisma } from '../../generated/prisma/client'

export const select = {
	id: true,
	creatorId: true,
	metadata: {
		select: {
			name: true,
			symbol: true,
			description: true,
			image: true,
			thumbhash: true,
		},
	},
	bondingCurve: {
		select: {
			status: true,
			tradingFees: true,
			updatedAt: true,
			currentReserve: true,
			targetReserve: true,
		},
	},
	marketData: {
		select: {
			price: true,
			marketCap: true,

			liquidity: true,
			volume: true,

			buyCount: true,
			sellCount: true,
		},
	},
} satisfies Prisma.TokenSelect
