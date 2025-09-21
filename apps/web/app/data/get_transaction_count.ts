import { prisma } from '@/app/utils/db'
import 'server-only'

export type TxCounts = {
	buys: number
	sells: number
	total: number
}

export async function getTransactionCount(id: string): Promise<TxCounts> {
	// Count buys & sells separately
	const [buyCount, sellCount] = await Promise.all([
		prisma.swapEvent.count({ where: { tokenId: id, swapType: 'Buy' } }),
		prisma.swapEvent.count({ where: { tokenId: id, swapType: 'Sell' } }),
	])

	return {
		buys: buyCount,
		sells: sellCount,
		total: buyCount + sellCount,
	}
}
