import { prisma } from '@/app/utils/db'
import { MetadataSchema } from '@/app/utils/schemas'
import { unstable_cache } from 'next/cache'
import 'server-only'

export async function getTokenMetadata(mint: string) {
	const token = await prisma.metadata.findUniqueOrThrow({
		where: {
			tokenId: mint,
		},

		select: {
			tokenId: true,
			name: true,
			symbol: true,
			description: true,
			image: true,
			thumbhash: true,
			createdAt: true,
			updatedAt: true,
		},
	})

	const parsed = MetadataSchema.safeParse(token)

	if (!parsed.success) {
		console.error(parsed.error.format())
		throw new Error('Invalid token metadata')
	}

	return parsed.data
}

export function getCachedTokenMetadata(mint: string) {
	return unstable_cache(
		async () => {
			return await getTokenMetadata(mint)
		},
		[mint], // add mint to the cache key
		{
			tags: [`metadata-${mint}`],
		},
	)()
}
