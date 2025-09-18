import { prisma } from '@/app/utils/db'
import 'server-only'

export async function getVolume(mint: string): Promise<string> {
	const volume = await prisma.swapEvent.aggregate({
		where: { tokenId: mint },
		_sum: { lamports: true },
	})

	return volume._sum.lamports?.toString() ?? '0'
}

export async function getVolumeRecord(ids: string[]): Promise<Record<string, string>> {
	if (!ids.length) return {}

	const rows = await prisma.swapEvent.groupBy({
		by: ['tokenId'],
		where: { tokenId: { in: ids } },
		_sum: { lamports: true },
	})

	return rows.reduce<Record<string, string>>(
		(acc, r) => {
			acc[r.tokenId] = r._sum.lamports?.toString() ?? '0'
			return acc
		},
		Object.fromEntries(ids.map(id => [id, '0'])),
	)
}
