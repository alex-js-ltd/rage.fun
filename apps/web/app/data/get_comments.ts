import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import 'server-only'

const select = Prisma.validator<Prisma.CommentSelect>()({
	id: true,
	ownerId: true,
	createdAt: true,
	content: true,
	tokenId: true,
})

type CommentPayload = Prisma.CommentGetPayload<{
	select: typeof select
}>

// Function to fetch comments dynamically with a token filter
export async function getComments(mint: string) {
	const query = Prisma.validator<Prisma.CommentFindManyArgs>()({
		where: {
			tokenId: mint,
			parentCommentId: null, // Only top-level comments
		},
		select,
		orderBy: {
			createdAt: 'desc', // Order comments by creation time
		},
	})

	const data = await prisma.comment.findMany(query)

	return data.map(toComment)
}

function toComment(comment: CommentPayload) {
	return {
		id: comment.id,
		ownerId: comment.ownerId,
		content: comment.content,
		tokenId: comment.tokenId,
		createdAt: comment.createdAt.toISOString(),
	}
}

export type Comment = ReturnType<typeof toComment>
