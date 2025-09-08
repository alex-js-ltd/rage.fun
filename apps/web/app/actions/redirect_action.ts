'use server'

import { redirect } from 'next/navigation'
import { parseWithZod } from '@conform-to/zod'
import { RedirectSchema } from '@/app/utils/schemas'

export async function redirectAction(formData: FormData) {
	const submission = parseWithZod(formData, {
		schema: RedirectSchema,
	})

	if (submission.status !== 'success') {
		return
	}

	const { pathname } = submission.value

	redirect(pathname)
}
