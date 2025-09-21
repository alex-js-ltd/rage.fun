import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'

export async function getRandomToken() {
	const latest = await prisma.token.findMany({
		orderBy: { createdAt: 'desc' },
		take: 2,
		select: { id: true, createdAt: true }, // add fields you need
	})

	return latest[Math.floor(Math.random() * latest.length)]
}
