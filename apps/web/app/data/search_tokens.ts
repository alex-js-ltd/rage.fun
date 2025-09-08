import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { type TokenMetadataType, TokenMetadataSchema } from '@/app/utils/schemas'
import 'server-only'

export async function searchTokens(symbol: string) {
	if (symbol === '') return []

	const query = Prisma.validator<Prisma.TokenMetadataFindManyArgs>()({
		where: {
			bondingCurve: { isNot: null },
			symbol: { contains: symbol, mode: 'insensitive' },
		},
		orderBy: {
			createdAt: 'asc',
		},
		select: {
			id: true,
			name: true,
			symbol: true,
			description: true,
			image: true,
			thumbhash: true,
			creatorId: true,
			createdAt: true,
			updatedAt: true,
		}, // ← Here we apply the defined select
	})

	const tokens = await prisma.tokenMetadata.findMany(query)

	const data = tokens.reduce<TokenMetadataType[]>((acc, curr) => {
		const parsed = TokenMetadataSchema.safeParse(curr)

		if (parsed.success) {
			acc.push(parsed.data)
		} else {
			console.log(parsed.error)
		}

		return acc
	}, [])
	return data
}
