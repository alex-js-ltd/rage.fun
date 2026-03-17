import { type Prisma } from '../../generated/prisma/client'

export const selectTokenMetadata = {
	symbol: true,
	image: true,
	thumbhash: true,
} satisfies Prisma.MetadataSelect satisfies Prisma.MetadataSelect
