import { prisma } from '@repo/database'
import 'server-only'

export async function getCreatorId(mint: string) {
	const token = await prisma.token.findUniqueOrThrow({
		where: { id: mint },
	})

	return token.creatorId
}
