import { prisma } from '@/app/utils/db'
import { createTokenFeedSchema } from '@/app/utils/schemas'
import { getCachedSolPrice } from './get_sol_price'
import { getTransactionCount } from './get_transaction_count'
import { getVolume } from './get_volume'
import 'server-only'

export async function getTokenWithRelations(mint: string) {
	const token = await prisma.token.findUniqueOrThrow({
		where: {
			id: mint,
		},

		include: { metadata: true, bondingCurve: true },
	})

	console.log(token)

	const solPricePromise = getCachedSolPrice()

	const transactionPromise = getTransactionCount(token.id)

	const volumePromise = getVolume(token.id)

	const TokenFeedSchema = await createTokenFeedSchema({
		solPricePromise,
		transactionPromise,
		volumePromise,
	})

	const parsed = await TokenFeedSchema.safeParseAsync(token)

	console.log(parsed.error)
	if (!parsed.success) {
		console.error(parsed.error.format())
		throw new Error('Invalid token with relations')
	}

	return parsed.data
}
