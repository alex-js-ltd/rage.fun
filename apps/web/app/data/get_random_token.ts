import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'

export async function getRandomToken() {
	const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

	const total = await prisma.token.count({
		where: { createdAt: { lt: fiveMinutesAgo } },
	})

	if (total === 0) throw new Error('No eligible tokens')

	const randomIndex = Math.floor(Math.random() * total)

	const token = await prisma.token.findFirstOrThrow({
		where: { createdAt: { lt: fiveMinutesAgo } },
		skip: randomIndex,
		select: { id: true, createdAt: true }, // add fields as needed
	})

	return token
}
