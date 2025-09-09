import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { type TokenMetadataType, MetadataSchema } from '@/app/utils/schemas'
import 'server-only'

export async function searchTokens(symbol: string) {
	if (symbol === '') return []

	const query = Prisma.validator<Prisma.TokenFindManyArgs>()({
		where: {
			bondingCurve: { isNot: null },
			metadata: { symbol: { contains: symbol, mode: 'insensitive' } },
		},
		orderBy: {
			createdAt: 'asc',
		},
		select: {
			id: true,
			creatorId: true,
			metadata: {
				select: {
					name: true,
					symbol: true,
					description: true,
					image: true,
					thumbhash: true,
					createdAt: true,
					updatedAt: true,
					tokenId: true,
				},
			},
		}, // ← Here we apply the defined select
	})

	const tokens = await prisma.token.findMany(query)

	const data = tokens.reduce<TokenMetadataType[]>((acc, curr) => {
		const parsed = MetadataSchema.safeParse(curr.metadata)

		if (parsed.success) {
			acc.push(parsed.data)
		} else {
			console.log(parsed.error)
		}

		return acc
	}, [])
	return data
}
