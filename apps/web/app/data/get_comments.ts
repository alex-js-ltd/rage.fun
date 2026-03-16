import { prisma, selectComment as select } from '@repo/database'
import type { CommentRow } from '@repo/database'
import 'server-only'

// Function to fetch comments dynamically with a token filter
export async function getComments(mint: string) {
	const data = await prisma.comment.findMany({
		where: {
			tokenId: mint,
			parentCommentId: null, // Only top-level comments
		},
		select,
		orderBy: {
			createdAt: 'desc', // Order comments by creation time
		},
	})

	return data.map(toComment)
}

function toComment(comment: CommentRow) {
	return {
		id: comment.id,
		ownerId: comment.ownerId,
		content: comment.content,
		tokenId: comment.tokenId,
		createdAt: comment.createdAt.toISOString(),
	}
}

export type Comment = ReturnType<typeof toComment>
