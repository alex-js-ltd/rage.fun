import { type Prisma } from '../../generated/prisma/client'

export const selectSwapEvents = {
	id: true,
	signer: true,
	time: true,
	price: true,
	tokenAmount: true,
	swapType: true,
	lamports: true,
	rentAmount: true,
	tokenId: true,
} satisfies Prisma.SwapEventSelect
