import { prisma } from '@/app/utils/db'
import { createTokenFeedSchema } from '@/app/utils/schemas'
import { getSolPrice } from '@/app/data/get_sol_price'

import 'server-only'

export async function getTokenWithRelations(mint: string) {
	const token = await prisma.token.findUniqueOrThrow({
		where: {
			id: mint,
		},

		include: { metadata: true, bondingCurve: true, marketData: true },
	})

	const res = await getSolPrice()

	if (!res) {
		throw new Error('failed to fetch sol price')
	}

	const solPrice = res.usd

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
