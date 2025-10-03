import { prisma } from '@/app/utils/db'
import { createTokenFeedSchema } from '@/app/utils/schemas'
import { getSolPrice } from '@/app/data/get_sol_price'
import { unstable_cache } from 'next/cache'
import 'server-only'

export async function getTokenFeed(mint: string) {
	const token = await prisma.token.findUniqueOrThrow({
		where: {
			id: mint,
		},

		include: { metadata: true, bondingCurve: true, marketData: true },
	})

	const solPrice = await getSolPrice()

	const TokenFeedSchema = createTokenFeedSchema({
		solPrice,
	})

	const parsed = TokenFeedSchema.safeParse(token)

	if (!parsed.success) {
		console.error(parsed.error.format())
		throw new Error('Invalid token with relations')
	}

	return parsed.data
}

export function getCachedTokenFeed(mint: string) {
	return unstable_cache(
		async () => {
			return await getTokenFeed(mint)
		},
		[mint], // add mint to the cache key
		{
			tags: [`feed-${mint}`],
		},
	)()
}
