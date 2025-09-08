import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { CommentSchema, CommentType } from '@/app/utils/schemas'
import 'server-only'

// Function to fetch comments dynamically with a token filter
export async function getComments(mint: string) {
	const query = Prisma.validator<Prisma.CommentFindManyArgs>()({
		where: {
			tokenId: mint,
			parentCommentId: null, // Only top-level comments
		},
		include: {
			owner: true, // Include owner data
			childComments: {
				include: {
					owner: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc', // Order comments by creation time
		},
	})

	const comments = await prisma.comment.findMany(query)

	const data = comments.reduce<CommentType[]>((acc, curr) => {
		const parsed = CommentSchema.safeParse(curr)

		if (parsed.success) {
			acc.push(parsed.data)
		} else {
			console.log(parsed)
		}

		return acc
	}, [])

	return data
}
