import { prisma } from '@/app/utils/db'
import 'server-only'

export async function getVolume(mint: string): Promise<string> {
	const volume = await prisma.swapEvent.aggregate({
		where: { tokenId: mint },
		_sum: { lamports: true },
	})

	return volume._sum.lamports?.toString() ?? '0'
}
