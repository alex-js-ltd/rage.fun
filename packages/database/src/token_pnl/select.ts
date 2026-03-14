import { type Prisma } from '../../generated/prisma/client'

export const selectTokenPnl = {
	tokenId: true,
	signer: true,
	bought: true,
	sold: true,
	realizedPnl: true,
} satisfies Prisma.TokenPnlSelect
