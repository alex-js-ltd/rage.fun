import { prisma } from '@/app/utils/db'
import { fromLamports } from '@repo/rage'
import { BN } from '@coral-xyz/anchor'
import { getRageWallet } from '@/app/data/get_rage_wallet'

import { getTokenFeed } from '@/app/data/get_token_feed'
import { calculateSellPrice } from '@/app/utils/wasm'

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
		const bought = u.pnl?.bought ?? BigInt('0')
		const sold = u.pnl?.sold ?? BigInt('0')
		const realized = u.pnl?.realizedPnl ?? BigInt('0')

		// ROI% on realized PnL only. Guard against divide-by-zero.
		const roiPct = bought > BigInt('0') ? (Number(realized) / Number(bought)) * 100 : 0

		const netFlow = sold - bought

		const pnl = { roi: roiPct, bought: fromLamports(new BN(bought.toString()), 9) }

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

async function getUserPosition(userId: string) {
	const wallet = await getRageWallet(userId)
}
