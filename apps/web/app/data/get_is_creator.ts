import { prisma } from '@repo/database'
import 'server-only'

export async function getIsCreator(creatorId: string | undefined) {
	if (!creatorId) {
		return false
	}
	const count = await prisma.token.count({
		where: { creatorId },
	})

	if (count > 0) {
		return true
	}
}
