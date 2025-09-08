import { prisma } from '@/app/utils/db'
import { TokenMetadataSchema, TokenMetadataType } from '@/app/utils/schemas'
import 'server-only'

export async function getAllTokens() {
	const tokens = await prisma.tokenMetadata.findMany({
		where: {
			bondingCurve: { isNot: null },
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
		},
	})

	const data = tokens.reduce<TokenMetadataType[]>((acc, curr) => {
		const parsed = TokenMetadataSchema.safeParse(curr)
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
