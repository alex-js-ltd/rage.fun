import { cache } from 'react'
import { prisma, selectTokenMetadata as select } from '@repo/database'
import type { MetadataRow } from '@repo/database'
import 'server-only'

export const getTokenMetadata = cache(async (mint: string) => {
	const token = await prisma.metadata.findUniqueOrThrow({
		where: { tokenId: mint },
		select,
	})

	return toMetadata(token)
})

function toMetadata(metadata: MetadataRow) {
	return { ...metadata, thumbhash: Buffer.from(metadata.thumbhash).toString('base64') }
}

export type TokenMetadata = ReturnType<typeof toMetadata>
