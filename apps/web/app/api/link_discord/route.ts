import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { kv } from '@vercel/kv'

const cookieName = process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token'

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams

	const userId = searchParams.get('userId')

	console.log('userId to restore session', userId)

	if (!userId) {
		return NextResponse.json({ success: false }, { status: 404 })
	}
	// 1. Load the saved wallet session token
	const savedToken = await kv.get<string>(`session:${userId}`)

	console.log('saved', savedToken)

	if (!savedToken) {
		throw new Error('No saved wallet session token found or it expired')
	}

	// 2. Write that token back as the active session cookie
	const cookieStore = await cookies()

	cookieStore.set({
		name: cookieName,
		value: savedToken,
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
	})

	// 4. Redirect back to your app (e.g., /home)
	return NextResponse.redirect(new URL('/home', req.url))
}
