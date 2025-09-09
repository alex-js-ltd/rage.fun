import { prisma } from '@/app/utils/db'
import { MetadataSchema, TokenMetadataType } from '@/app/utils/schemas'
import 'server-only'

export async function getAllTokens() {
	const tokens = await prisma.token.findMany({
		where: {
			bondingCurve: { isNot: null },
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
				},
			},
		},
	})

	const data = tokens.reduce<TokenMetadataType[]>((acc, curr) => {
		const parsed = MetadataSchema.safeParse(curr.metadata)
		if (parsed.success) {
			acc.push(parsed.data)
		} else {
			console.error(parsed.error.format())
			throw new Error('Invalid token metadata')
		}
		return acc
	}, [])

	return data
}
