'use server'

import { signIn, signOut } from '@/app/auth'
import { AuthError } from 'next-auth'
import { parseWithZod } from '@conform-to/zod'
import { AuthSchema } from '@/app/utils/schemas'

export async function authenticate(_prevState: any, formData: FormData) {
	const submission = parseWithZod(formData, {
		schema: AuthSchema,
	})

	if (submission.status !== 'success') {
		return {
			...submission.reply(),
		}
	}

	try {
		await signIn('credentials', { ...submission.value, redirect: true })
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
