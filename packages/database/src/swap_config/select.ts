import { type Prisma } from '../../generated/prisma/client'

export const selectSwapConfig = {
	id: true,

	metadata: {
		select: {
			symbol: true,
			image: true,
			thumbhash: true,
		},
	},
	bondingCurve: {
		select: {
			virtualReserve: true,
			currentReserve: true,
			targetReserve: true,
			virtualSupply: true,
			currentSupply: true,
			targetSupply: true,
			connectorWeight: true,
			decimals: true,
		},
	},
} satisfies Prisma.TokenSelect
