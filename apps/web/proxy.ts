import { ipAddress } from '@vercel/edge'
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

import type { NextRequest, NextFetchEvent } from 'next/server'
import { NextResponse } from 'next/server'
import { NextURL } from 'next/dist/server/web/next-url'
import NextAuth, { type Session } from 'next-auth'
import { authConfig } from '@/app/auth.config'
import { getServerEnv } from '@/app/utils/env'
import 'server-only'

const { HELIUS_SECRET } = getServerEnv()

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
}

const ratelimit = new Ratelimit({
	redis: kv,
	prefix: 'rl:w:',
	limiter: Ratelimit.tokenBucket(
		5, // refillRate: 3 tokens per interval
		'10 s', // interval: every 10 seconds
		30, // maxTokens: bucket can hold up to 30 for bursts
	),
	enableProtection: true,
})

// 2. Wrapped middleware option
const { auth } = NextAuth(authConfig)

export default auth(async function proxy(req: NextRequest & { auth: Session | null }, context: NextFetchEvent) {
	console.log('[Middleware] Triggered for:', req.nextUrl.pathname)

	const requestHeaders = new Headers(req.headers)
	const authorization = requestHeaders.get('authorization')
	const ip = ipAddress(req) || '127.0.0.1'

	const path = req.nextUrl.pathname

	const blockedIp = await getBlockedIp<{ reason: string; time: number }>(ip)

	if (blockedIp && ip != '127.0.0.1') {
		console.warn(`🚨 BLOCKED IP DETECTED: ${ip}`)
		return NextResponse.redirect('https://www.fbi.gov')
	}

	if (authorization === HELIUS_SECRET && path.startsWith('/api/helius')) {
		const res = NextResponse.next()
		return res
	}

	if (authorization !== HELIUS_SECRET && path.startsWith('/api/helius')) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	if (path.startsWith('/api/pinata') && !req.auth) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	if (path.startsWith('/api/quick_option') && !!req.auth) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { success, pending, limit, reset, remaining } = await ratelimit.limit(`${ip}:${path}`)

	context.waitUntil(pending)

	console.log('[RateLimit]', {
		ip,
		path: req.nextUrl.pathname,
		remaining,
		id: req.auth?.user?.id,
	})

	if (!success) {
		const res = NextResponse.redirect(new URL('/api/blocked', req.url))

		res.headers.set('X-RateLimit-Success', success.toString())
		res.headers.set('X-RateLimit-Limit', limit.toString())
		res.headers.set('X-RateLimit-Remaining', remaining.toString())

		return res
	}

	if (req.nextUrl.pathname === '/') {
		const searchUrl = new NextURL('/home', req.nextUrl)
		const res = NextResponse.redirect(searchUrl)
		res.headers.set('X-RateLimit-Success', success.toString())
		res.headers.set('X-RateLimit-Limit', limit.toString())
		res.headers.set('X-RateLimit-Remaining', remaining.toString())

		return res
	}

	// Return a NextResponse object for other paths
	const res = NextResponse.next()

	res.headers.set('X-RateLimit-Success', success.toString())
	res.headers.set('X-RateLimit-Limit', limit.toString())
	res.headers.set('X-RateLimit-Remaining', remaining.toString())

	return res
})

async function getBlockedIp<DataType>(ip: string): Promise<DataType | null> {
	try {
		const res = await kv.get<DataType>(`blocked_ip:${ip}`)
		return res ?? null
	} catch (err) {
		console.error(`❌ Failed to fetch blocked IP: ${ip}`, err)
		return null
	}
}
