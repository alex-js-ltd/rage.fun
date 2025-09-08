import { prisma } from '@/app/utils/db'
import { unstable_cache } from 'next/cache'
import 'server-only'

export async function getTransactionCount(mint: string) {
	const rows = await prisma.swapEvent.groupBy({
		by: ['swapType'],
		where: { tokenId: mint },
		_count: { _all: true },
	})

	const counts = Object.fromEntries(rows.map(r => [r.swapType, r._count._all]))
	const buys = counts['BUY'] ?? 0
	const sells = counts['SELL'] ?? 0
	const total = Object.values(counts).reduce((a, b) => a + b, 0)

	return { buys, sells, total } as const
}
