import { prisma } from '@/app/utils/db'
import { createTokenFeedSchema } from '@/app/utils/schemas'
import { getCachedSolPrice } from './get_sol_price'
import { getTransactionRecord } from './get_transaction_count'
import { getVolumeRecord } from './get_volume'
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
	const transactionRecordPromise = getTransactionRecord([token.id])
	const volumeRecordPromise = getVolumeRecord([token.id])

	const [solPrice, transactionRecord, volumeRecord] = await Promise.all([
		solPricePromise,
		transactionRecordPromise,
		volumeRecordPromise,
	])

	const transactionCount = transactionRecord[token.id]
	const volume = volumeRecord[token.id]

	const TokenFeedSchema = createTokenFeedSchema({
		solPrice,
		transactionCount,
		volume,
	})

	const parsed = TokenFeedSchema.safeParse(token)

	if (!parsed.success) {
		console.error(parsed.error.format())
		throw new Error('Invalid token with relations')
	}

	return parsed.data
}
