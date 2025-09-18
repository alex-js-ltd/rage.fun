import { prisma } from '@/app/utils/db'
import 'server-only'

export type TxCounts = {
	buys: number
	sells: number
	total: number
}

export async function getTransactionRecord(ids: string[]): Promise<Record<string, TxCounts>> {
	if (!ids.length) return {}

	const rows = await prisma.swapEvent.groupBy({
		by: ['tokenId', 'swapType'],
		where: { tokenId: { in: ids } },
		_count: { _all: true },
	})

	return rows.reduce<Record<string, TxCounts>>(
		(acc, r) => {
			const existing = acc[r.tokenId] ?? { buys: 0, sells: 0, total: 0 }
			const n = r._count._all

			if (r.swapType === 'Buy') existing.buys += n
			if (r.swapType === 'Sell') existing.sells += n
			existing.total += n

			acc[r.tokenId] = existing
			return acc
		},
		Object.fromEntries(ids.map(id => [id, { buys: 0, sells: 0, total: 0 }])),
	)
}
