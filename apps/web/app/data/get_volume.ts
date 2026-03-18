import { prisma } from '@repo/database'
import 'server-only'

export async function getVolume(id: string): Promise<bigint> {
	const volume = await prisma.swapEvent.aggregate({
		where: { tokenId: id },
		_sum: { lamports: true },
	})

	return volume._sum.lamports ?? BigInt('0')
}
