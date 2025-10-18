import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import 'server-only'

const occupy = { id: '3L9GsKR6ZyobfNoEUxvkUpNLTrRysmFEfwKduQv5HSme' }

export async function getRandomToken(buy?: boolean) {
	const since = dayjs().subtract(5, 'minute').toDate()

	const exclude: Array<string> = []

	const latest = await prisma.token.findMany({
		where: { createdAt: { lt: since }, creatorId: { notIn: exclude } },
		orderBy: { createdAt: 'desc' },

		select: { id: true, createdAt: true },
	})

	const randomIndex = Math.floor(Math.random() * latest.length)

	const t = latest[randomIndex]

	return buy ? occupy : latest[randomIndex]
}
