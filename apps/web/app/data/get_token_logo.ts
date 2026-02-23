import { cache } from 'react'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import 'server-only'

const select = Prisma.validator<Prisma.TokenSelect>()({
	id: true,

	metadata: {
		select: {
			symbol: true,
			image: true,
			thumbhash: true,
		},
	},
})

type TokenPayload = Prisma.TokenGetPayload<{
	select: typeof select
}>

function getMetadata(metadata: NonNullable<TokenPayload['metadata']>) {
	return { ...metadata, thumbhash: Buffer.from(metadata.thumbhash).toString('base64') }
}

function toLogo(token: TokenPayload) {
	if (!token.metadata) {
		throw new Error('Missing required relations')
	}

	const { id, metadata } = token

	return { id, metadata: getMetadata(metadata) }
}

export async function getTokenLogo(mint: string) {
	const token = await prisma.token.findUniqueOrThrow({
		where: { id: mint },
		select,
	})

	return toLogo(token)
}

export type TokenLogo = ReturnType<typeof toLogo>
