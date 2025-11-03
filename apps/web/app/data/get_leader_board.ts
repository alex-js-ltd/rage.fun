import { prisma } from '@/app/utils/db'

export async function getLeaderBoard(limit = 100) {
	const users = await prisma.user.findMany({
		include: {
			pnl: true, // include their PnL record
		},
		orderBy: {
			pnl: {
				realizedPnl: 'desc', // sort by highest realized profit
			},
		},
		take: 5,
	})

	console.log(users)

	return users
}
