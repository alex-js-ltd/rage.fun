import { type Prisma } from '../../generated/prisma/client'

export const selectComment = {
	id: true,
	ownerId: true,
	createdAt: true,
	content: true,
	tokenId: true,
} satisfies Prisma.CommentSelect
