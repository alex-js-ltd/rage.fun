import { prisma } from '@/app/utils/db'
import { createTokenWithRelationsSchema } from '@/app/utils/schemas'
import { getCachedSolPrice } from './get_sol_price'
import { getTransactionCount } from './get_transaction_count'
import 'server-only'

export async function getTokenWithRelations(mint: string) {
	const token = await prisma.token.findUniqueOrThrow({
		where: {
			id: mint,
		},

		include: { bondingCurve: true },
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
