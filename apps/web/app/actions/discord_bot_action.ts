'use server'

import { SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { DiscordBotSchema } from '@/app/utils/schemas'
import { client } from '@/app/utils/client'
import { getServerEnv } from '@/app/utils/env'

const { DISCORD_WEBHOOK_URL_CHAT } = getServerEnv()

export type State =
	| (SubmissionResult<string[]> & {
			content?: string
	  })
	| undefined

export async function leaveAComment(prevState: State, formData: FormData) {
	const submission = parseWithZod(formData, {
		schema: DiscordBotSchema,
	})

	if (submission.status !== 'success') {
		return {
			...submission.reply(),
			content: undefined,
		}
	}

	const { content } = submission.value

	// Then in your Discord webhook payload:
	const payload = {
		content,
	}

	try {
		const res = await client(DISCORD_WEBHOOK_URL_CHAT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		console.log('✅ Webhook sent:', res)
	} catch (error) {
		console.error('Error sending message to Discord:', error)
	}

	return {
		...submission.reply(),
		content,
	}
}
