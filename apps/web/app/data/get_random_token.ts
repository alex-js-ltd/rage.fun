import { prisma } from '@/app/utils/db'
import { Prisma, SwapType, SwapEvent, $Enums } from '@prisma/client'

export async function getRandomToken() {
	const count = await prisma.token.count()

	const skip = Math.floor(Math.random() * count)

	return await prisma.token.findFirstOrThrow({ skip })
}
