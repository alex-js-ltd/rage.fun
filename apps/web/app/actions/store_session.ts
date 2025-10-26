// app/actions/storeCurrentSession.ts
'use server'

import { cookies } from 'next/headers'
import { kv } from '@vercel/kv'
import { auth } from '@/app/auth'

const cookieName = process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token'

export async function storeSession() {
	const session = await auth()

	const userId = session?.user?.id

	const cookieStore = await cookies()
	const currentSession = cookieStore.get(cookieName)?.value

	if (!currentSession) {
		console.warn('no session cookie found')
		return
	}

	// store just the raw token string
	await kv.set(
		`session:${userId}`,
		currentSession,
		{ ex: 300 }, // expire in 5 min so it’s not reusable forever
	)
	if (!currentSession) throw new Error('no session cookie')

	await kv.set(`session:${userId}`, currentSession, { ex: 300 })

	console.log('session stored')
}
