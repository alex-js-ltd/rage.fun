import { prisma } from '@/app/utils/db'

export async function getTopTradersAllTime(limit = 20) {
	const users = await prisma.user.findMany({
		orderBy: { pnl: { realizedPnl: 'desc' } }, // 👈 order by related UserPnl
		take: limit,

		where: {
			// optional: only users who have a pnl row
			pnl: { isNot: null },
		},

		include: {
			pnl: true,
		},
	})

	const data = users.reduce((acc, curr) => {
		return acc
	})
}
