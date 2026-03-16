import { type Prisma } from '../../generated/prisma/client'

export const selectTrending = {
	id: true,

	metadata: {
		select: {
			symbol: true,

			image: true,
			thumbhash: true,
		},
	},

	marketData: {
		select: {
			volume: true,
		},
	},
} satisfies Prisma.TokenSelect
