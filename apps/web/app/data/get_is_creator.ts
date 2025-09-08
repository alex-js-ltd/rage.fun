import { prisma } from '@/app/utils/db'
import 'server-only'

export async function getIsCreator(creatorId: string | undefined) {
	if (!creatorId) {
		return false
	}
	const count = await prisma.tokenMetadata.count({
		where: { creatorId },
	})

	if (count > 0) {
		return true
	}
}
