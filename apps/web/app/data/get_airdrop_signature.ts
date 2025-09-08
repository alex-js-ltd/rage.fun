import { prisma } from '@/app/utils/db'
import { type AirdropSignatureType, AirdropSignatureSchema } from '@/app/utils/schemas'
import 'server-only'

export async function getAirdropSignature(signature: string): Promise<AirdropSignatureType> {
	const airdrop = await prisma.airdropSignature.findUnique({
		where: {
			id: signature,
		},

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

	const parsed = AirdropSignatureSchema.safeParse(airdrop)

	if (!parsed.success) {
		console.error(parsed.error.format())
		throw new Error('Invalid airdrop')
	}

	return parsed.data
}

export const dynamic = 'force-dynamic'
