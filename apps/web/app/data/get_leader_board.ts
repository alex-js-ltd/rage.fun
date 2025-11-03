import { prisma } from '@/app/utils/db'
import { RowsIcon } from '@radix-ui/react-icons'

export async function getLeaderBoard(limit = 100) {
	const rows = await prisma.user.findMany({
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

	if (rows.length === 0) {
		throw new Error('No users found')
	}

	return rows.map(u => {
		const bought = u.pnl?.bought ?? 0n
		const sold = u.pnl?.sold ?? 0n
		const realized = u.pnl?.realizedPnl ?? 0n

		// ROI% on realized PnL only. Guard against divide-by-zero.
		const roiPct = bought > 0n ? (Number(realized) / Number(bought)) * 100 : null

		const netFlow = sold - bought

		return {
			userId: u.id,
			name: u.name,
			image: u.image,
			bought,
			sold,
			realizedPnl: realized,
			roiPct,
			netFlow,
		}
	})
}
