// app/actions/storeCurrentSession.ts
'use server'

import { cookies } from 'next/headers'
import { kv } from '@vercel/kv'
import { auth } from '@/app/auth'

const cookieName = process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token'

export async function storeSession() {
	const session = await auth()

	const userId = session?.user?.id

	console.log('userId to store session', userId)

	const cookieStore = await cookies()
	const currentSession = cookieStore.get(cookieName)?.value

	if (!currentSession) {
		console.warn('no session cookie found')
		return
	}

	// store just the raw token string
	await kv.set(`session:${userId}`, currentSession)

	if (!currentSession) throw new Error('no session cookie')

	return userId
}
