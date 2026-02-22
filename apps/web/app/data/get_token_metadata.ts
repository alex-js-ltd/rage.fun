import { prisma } from '@/app/utils/db'
import 'server-only'

export async function getTokenMetadata(mint: string) {
	const data = await prisma.metadata.findUniqueOrThrow({
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
		},
	})

	return { ...data, thumbhash: Buffer.from(data.thumbhash).toString('base64') }
}
