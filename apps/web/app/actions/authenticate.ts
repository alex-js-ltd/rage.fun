'use server'

import { signIn, signOut } from '@/app/auth'
import { AuthError } from 'next-auth'
import { AuthSchema } from '@/app/utils/schemas'
import { parseSubmission, report } from '@conform-to/react/future'

export async function authenticate(_prevState: unknown, formData: FormData) {
	const submission = parseSubmission(formData)

	const result = AuthSchema.safeParse(submission.payload)

	if (!result.success) {
		return {
			...report(submission, {
				error: {
					issues: result.error.issues,
				},
			}),
		}
	}

	try {
		await signIn('credentials', { ...result.data, redirect: true })
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case 'CredentialsSignin':
					return 'Invalid credentials.'
				default:
					return 'Something went wrong.'
			}
		}
		throw error
	}
}

export async function disconnect() {
	await signOut({ redirect: true })
}
