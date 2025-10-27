import { prisma } from '@/app/utils/db'
import { getSolPrice } from '@/app/data/get_sol_price'
import { createPnLSchema } from '@/app/utils/schemas'

import 'server-only'

export async function getPnLForToken(mint: string) {
	const pnl = await prisma.pnl.findMany({
		where: {
			tokenId: mint,
		},

		orderBy: {
			realizedPnl: 'desc', // 👈 biggest profit first
		},
	})

	console.log(pnl)

	const solPrice = await getSolPrice()

	const PnlSchema = createPnLSchema({ solPrice })

	const data = pnl.map(p => {
		const parsed = PnlSchema.safeParse(p)

		if (!parsed.success) {
			console.error(parsed.error.format())
			throw new Error('Invalid pnl schema')
		}

		return parsed.data
	})

	return data
}
