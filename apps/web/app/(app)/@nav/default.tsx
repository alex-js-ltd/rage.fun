import { cookies } from 'next/headers'
import { Nav } from '@/app/comps/nav'
import { auth } from '@/app/auth'

export const dynamic = 'force-dynamic'

export default async function Default() {
	const nonce = await getNonceFromCookie()
	const session = await auth()
	console.log('nonce', nonce)

	return <Nav nonce={nonce} session={session} />
}

async function getNonceFromCookie() {
	const cookieStore = await cookies()

	// Handle all modern + legacy cookie names
	const raw =
		cookieStore.get('__Host-authjs.csrf-token')?.value ??
		cookieStore.get('authjs.csrf-token')?.value ??
		cookieStore.get('next-auth.csrf-token')?.value ??
		''

	if (!raw) {
		console.warn('[auth] No CSRF token cookie found')
		return ''
	}

	// Sometimes cookie is "nonce|hash"
	const nonce = raw.split('|')[0] ?? ''
	return nonce
}
