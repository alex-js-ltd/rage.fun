import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import 'server-only'

export async function getRandomToken() {
	const since = dayjs().subtract(5, 'minute').toDate()

	const latest = await prisma.token.findMany({
		where: { createdAt: { lt: since } },
		orderBy: { createdAt: 'desc' },

		select: { id: true, createdAt: true }, // add other fields if needed
	})

	const randomIndex = Math.floor(Math.random() * latest.length)

	return latest[randomIndex]
}
