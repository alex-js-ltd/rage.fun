import { prisma } from '@/app/utils/db'
import { getSolPrice } from '@/app/data/get_sol_price'
import { createPnLSchema } from '@/app/utils/schemas'
import { ZodError } from 'zod'
import 'server-only'

export async function getPnLForToken(mint: string) {
	const pnl = await prisma.tokenPnl.findMany({
		where: {
			tokenId: mint,

			sold: {
				gt: 0, // only include wallets that sold something
			},
		},

		orderBy: {
			realizedPnl: 'desc', // 👈 biggest profit first
		},
	})

	const solPrice = await getSolPrice()

	const PnlSchema = createPnLSchema({ solPrice })

	const data = pnl.map(p => {
		const parsed = PnlSchema.safeParse(p)
		if (!parsed.success) {
			// 🧨 Wrap the Zod issues into a thrown ZodError
			throw new ZodError(
				parsed.error.issues.map(issue => ({
					...issue,
					path: ['pnl', ...issue.path], // optional: prefix path with index
				})),
			)
		}

		return parsed.data
	})

	return data
}
