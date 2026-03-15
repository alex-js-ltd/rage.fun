import { type Prisma } from '../../generated/prisma/client'

export const selectTokenAlert = {
	id: true,

	metadata: {
		select: {
			symbol: true,
			image: true,
		},
	},

	bondingCurve: {
		select: { currentSupply: true, currentReserve: true, decimals: true, targetReserve: true },
	},
} satisfies Prisma.TokenSelect
