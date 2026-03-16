import { type Prisma } from '../../generated/prisma/client'

export const selectSearchResults = {
	id: true,

	metadata: {
		select: {
			symbol: true,
			image: true,
			thumbhash: true,
		},
	},
} satisfies Prisma.TokenSelect
