import { ipAddress } from '@vercel/edge'
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

import { type NextRequest, NextResponse, type NextFetchEvent } from 'next/server'
import { NextURL } from 'next/dist/server/web/next-url'
import NextAuth, { type Session } from 'next-auth'
import { authConfig } from '@/app/auth.config'
import { getServerEnv } from '@/app/utils/env'

const { HELIUS_SECRET } = getServerEnv()

export const config = {
	matcher: ['/((?!_next/static|_next/image|.*\\.webp$).*)'], // Allow middleware to run on API routes
}

// Rate limiter for APIs (tighter)
const apiWindow = new Ratelimit({
	redis: kv,
	limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export const apiBucket = new Ratelimit({
	redis: kv,
	prefix: 'rl:w:',
	limiter: Ratelimit.tokenBucket(
		3, // refillRate: 3 tokens per interval
		'10 s', // interval: every 10 seconds
		30, // maxTokens: bucket can hold up to 30 for bursts
	),
})

// Rate limiter for pages (looser)
const pageLimit = new Ratelimit({
	redis: kv,
	limiter: Ratelimit.slidingWindow(15, '10 s'),
})

// 2. Wrapped middleware option
const { auth } = NextAuth(authConfig)

export default auth(async function middleware(req: NextRequest & { auth: Session | null }) {
	console.log('[Middleware] Triggered for:', req.nextUrl.pathname)

	const requestHeaders = new Headers(req.headers)
	const authorization = requestHeaders.get('authorization')
	const ip = ipAddress(req) || '127.0.0.1'

	const path = req.nextUrl.pathname

	const isApiBucket = path.startsWith('/api/wasm') // token bucket
	const isApiWindow = path.startsWith('/api') && !isApiBucket // sliding window
	const isApi = isApiBucket || isApiWindow

	const ratelimit = isApiBucket ? apiBucket : isApiWindow ? apiWindow : pageLimit

	const blockedIp = await getBlockedIp<{ reason: string; time: number }>(ip)

	if (blockedIp && ip != '127.0.0.1') {
		console.warn(`🚨 BLOCKED IP DETECTED: ${ip}`)
		return NextResponse.redirect('https://www.fbi.gov')
	}

	if (authorization === HELIUS_SECRET && req.nextUrl.pathname.startsWith('/api/helius')) {
		const res = NextResponse.next()
		return res
	}

	if (authorization !== HELIUS_SECRET && req.nextUrl.pathname.startsWith('/api/helius')) {
		await kv.set(`blocked_ip:${ip}`, {
			reason: 'Invalid Helius authorization',
			time: Date.now(),
		})

		console.warn(`🚨 PERMA-BLOCKED IP: ${ip} tried /api/helius`)

		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	if (req.nextUrl.pathname.startsWith('/blocked')) {
		return NextResponse.next()
	}

	const { success, pending, limit, reset, remaining } = await ratelimit.limit(`${ip}:${req.nextUrl.pathname}`)

	console.log('[RateLimit]', {
		ip,
		path: req.nextUrl.pathname,
		remaining,
		id: req.auth?.user?.id,
	})

	if (!success && isApi) {
		const res = NextResponse.json(null, { status: 429 })

		res.headers.set('X-RateLimit-Success', success.toString())
		res.headers.set('X-RateLimit-Limit', limit.toString())
		res.headers.set('X-RateLimit-Remaining', remaining.toString())

		return res
	}

	if (!success && !isApi) {
		console.error(`🚨 ABUSIVE IP BLOCKED: ${ip}`)

		const blockedUrl = new NextURL('/blocked', req.nextUrl)

		const res = NextResponse.redirect(blockedUrl)

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
