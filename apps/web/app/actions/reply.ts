'use server'

import { parseSubmission, report } from '@conform-to/react/future'
import { ReplySchema } from '@/app/utils/schemas'
import { auth } from '@/app/auth'
import { prisma } from '@repo/database'
import type { Prisma } from '@repo/database'

import * as Ably from 'ably'
import { getServerEnv } from '@/app/utils/env'
import * as AblyEvents from '@/app/webhooks/ably'

const { ABLY_API_KEY } = getServerEnv()

export async function reply(_prevState: unknown, formData: FormData) {
	const session = await auth()

	if (!session) {
		console.error('no user session')

		return null
	}

	const submission = parseSubmission(formData)

	const result = ReplySchema.safeParse(submission.payload)

	if (!result.success) {
		return {
			...report(submission, {
				error: {
					issues: result.error.issues,
				},
			}),
		}
	}

	const { content, mint, publicKey, parentCommentId } = result.data

	console.log('parent comment id', parentCommentId)

	const parentComment = parentCommentId
		? { connect: { id: parentCommentId } } // If it's a reply, connect to the parent comment
		: undefined

	const create = {
		content,
		token: { connect: { id: mint.toBase58() } }, // ✅ Connect TokenMetadata
		owner: {
			connectOrCreate: {
				where: { id: publicKey.toBase58() }, // ✅ Check if user exists
				create: { id: publicKey.toBase58() }, // ✅ Create if not exists
			},
		},

		parentComment,
	} satisfies Prisma.CommentCreateInput

	const comment = await prisma.comment.create({ data: create })

	const client = new Ably.Rest(ABLY_API_KEY)

	const commentChannel = client.channels.get('commentEvent')

	await AblyEvents.publishCommentEvent(commentChannel, {
		id: comment.id,
		ownerId: comment.ownerId,
		content: comment.content,
		tokenId: comment.tokenId,
		createdAt: comment.createdAt.toISOString(),
	})

	return {
		...report(submission, {
			reset: true,
		}),
	}
}
