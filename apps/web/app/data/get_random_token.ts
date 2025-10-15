import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import 'server-only'

export async function getRandomToken(notIn?: boolean) {
	const since = dayjs().subtract(5, 'minute').toDate()

	const exclude = notIn
		? ['795Z4uFBZxK8c5uYwMKrMqNyEs4VXCZJ4DFRFJt6qH18', 'EbAo94MQ8YhKLiihQDsN6QD7zMm8SDKUbdbaD5ijPu8N']
		: []

	const latest = await prisma.token.findMany({
		where: { createdAt: { lt: since }, creatorId: { notIn: exclude } },
		orderBy: { createdAt: 'desc' },

		select: { id: true, createdAt: true },
	})

	const randomIndex = Math.floor(Math.random() * latest.length)

	return latest[randomIndex]
}
