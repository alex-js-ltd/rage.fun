import { prisma } from '@/app/utils/db'
import { createTokenFeedSchema } from '@/app/utils/schemas'
import { getSolPrice } from '@/app/data/get_sol_price'
import 'server-only'

export async function getTrending() {
	const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

	const rows = await prisma.token.findMany({
		where: {
			marketData: {
				is: { updatedAt: { gte: since } },
			},
			bondingCurve: { isNot: null },
			metadata: { isNot: null },
		},
		include: { metadata: true, bondingCurve: true, marketData: true },
		orderBy: { marketData: { volume: 'desc' } },
		take: 3,
	})

	const solPrice = await getSolPrice()

	const data = rows.map(token => {
		const TokenFeedSchema = createTokenFeedSchema({
			solPrice,
		})

		const parsed = TokenFeedSchema.safeParse(token)

		if (!parsed.success) {
			console.error(parsed.error.format())
			throw new Error('Invalid token with relations')
		}

		return parsed.data
	})

	return data
}
