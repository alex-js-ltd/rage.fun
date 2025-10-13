import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'

export async function getRandomToken() {
	const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

	// Get the 5 latest coins
	const latest = await prisma.token.findMany({
		where: { createdAt: { lt: fiveMinutesAgo } },
		orderBy: { createdAt: 'desc' },
		take: 5,
		select: { id: true, createdAt: true }, // add other fields if needed
	})

	const randomIndex = Math.floor(Math.random() * latest.length)

	return latest[randomIndex]
}
