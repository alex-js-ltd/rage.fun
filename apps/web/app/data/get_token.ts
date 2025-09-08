import { prisma } from '@/app/utils/db'
import { createTokenWithRelationsSchema } from '@/app/utils/schemas'
import { getCachedSolPrice } from './get_sol_price'
import { getTransactionCount } from './get_transaction_count'
import 'server-only'

export async function getTokenWithRelations(mint: string) {
	const token = await prisma.tokenMetadata.findUniqueOrThrow({
		where: {
			id: mint,
		},

		select: {
			id: true,
			name: true,
			symbol: true,
			description: true,
			image: true,
			thumbhash: true,
			creatorId: true,
			createdAt: true,
			updatedAt: true,
			bondingCurve: {
				select: {
					id: true,
					progress: true,
					connectorWeight: true,
					decimals: true,
					startTime: true,
					totalSupply: true,
					reserveBalance: true,
					targetReserve: true,
					marketCap: true,
					volume: true,
					tradingFees: true,
					tokenId: true,
					createdAt: true,
					updatedAt: true,
				},
			},
			nsfw: {
				select: {
					isNsfw: true,
				},
			},
		},
	})

	const solPrice = getCachedSolPrice()

	const transactionCount = getTransactionCount(token.id)

	const TokenWithRelationsSchema = createTokenWithRelationsSchema({
		solPrice,
		transactionCount,
	})

	const parsed = await TokenWithRelationsSchema.safeParseAsync(token)

	if (!parsed.success) {
		console.error(parsed.error.format())
		throw new Error('Invalid token with relations')
	}

	return parsed.data
}
