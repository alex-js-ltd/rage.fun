import { prisma } from '@/app/utils/db'

import { type AirdropSignatureType, AirdropSignatureSchema } from '@/app/utils/schemas'
import 'server-only'

export async function getHappeningNow() {
	const happening = await prisma.airdropSignature.findMany({
		orderBy: {
			createdAt: 'desc',
		},
		take: 10,
		select: {
			id: true,
			createdAt: true,
			updatedAt: true,
			tokenId: true,
			airdropId: true,

			airdropEvents: {
				select: {
					id: true,
					user: true,
					time: true,
					amount: true,
					signatureId: true,
				},
			},

			token: {
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

					bondingCurve: {
						select: {
							decimals: true,
						},
					},

					nsfw: {
						select: {
							isNsfw: true,
						},
					},
				},
			},
		},
	})

	const data = happening.reduce<AirdropSignatureType[]>((acc, curr) => {
		const parsed = AirdropSignatureSchema.safeParse(curr)

		if (parsed.success) {
			acc.push(parsed.data)
		} else {
			console.error(parsed.error)
		}

		return acc
	}, [])

	return data
}

export const dynamic = 'force-dynamic'
