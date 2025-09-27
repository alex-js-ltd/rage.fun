'use server'

import { signIn, signOut, auth } from '@/app/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

async function getCurrentPathname() {
	const ref = (await headers()).get('referer')
	const url = ref ? new URL(ref) : null
	const pathname = url?.pathname ?? '/'
	return pathname
}

export async function authenticate(publicKey: string) {
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

	const pathname = await getCurrentPathname()

	console.log('pathname', pathname)

	if (pathname === '/yield') {
		revalidatePath('/yield', 'layout')
		redirect('/yield') // forces a rebuild with new cookies
	}

	// if (pathname.startsWith('/token')) {
	// 	revalidatePath(`${pathname}?interval=86400000`, 'layout')
	// 	redirect(`${pathname}?interval=86400000`) // forces a rebuild with new cookies
	// }
}

export async function disconnect() {
	await signOut({ redirect: false })

	const pathname = await getCurrentPathname()

	if (pathname === '/yield') {
		revalidatePath('/yield', 'layout')
		redirect('/yield') // forces a rebuild with new cookies
	}

	// if (pathname.startsWith('/token')) {
	// 	revalidatePath(`${pathname}?interval=86400000`, 'layout')
	// 	redirect(`${pathname}?interval=86400000`) // forces a rebuild with new cookies
	// }
}
