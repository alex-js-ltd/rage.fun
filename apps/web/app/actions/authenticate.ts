'use server'

import { signIn, signOut, auth } from '@/app/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function authenticate(publicKey: string, url: string) {
	try {
		await signIn('credentials', { publicKey, redirect: false })
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
	console.log(url)
	revalidatePath(url, 'layout')
	redirect(url) // forces a rebuild with new cookies
}

export async function disconnect(url: string) {
	await signOut({ redirect: false })
	console.log(url)
	revalidatePath(url, 'layout')
	redirect(url) // forces a rebuild with new cookies
}
