'use server'

import { SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { ReplySchema } from '@/app/utils/schemas'
import { auth } from '@/app/auth'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'

import * as Ably from 'ably'
import { getServerEnv } from '@/app/utils/env'
import * as AblyEvents from '@/app/webhook/ably'
import { type Comment } from '@/app/data/get_comments'

const { ABLY_API_KEY } = getServerEnv()

export type State = SubmissionResult<string[]> | {}

export async function replyAction(_prevState: State, formData: FormData) {
	const session = await auth()

	if (!session) {
		console.error('no user session')

		return {}
	}

	const submission = parseWithZod(formData, {
		schema: ReplySchema,
	})

	if (submission.status !== 'success') {
		console.log('submission', submission)
		return {
			...submission.reply(),
		}
	}

	const { content, mint, publicKey, parentCommentId } = submission.value

	console.log('parent comment id', parentCommentId)

	const parentComment = parentCommentId
		? { connect: { id: parentCommentId } } // If it's a reply, connect to the parent comment
		: undefined

	const create = Prisma.validator<Prisma.CommentCreateInput>()({
		content,
		token: { connect: { id: mint.toBase58() } }, // ✅ Connect TokenMetadata
		owner: {
			connectOrCreate: {
				where: { id: publicKey.toBase58() }, // ✅ Check if user exists
				create: { id: publicKey.toBase58() }, // ✅ Create if not exists
			},
		},

		parentComment,
	})

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

	return {}
}
