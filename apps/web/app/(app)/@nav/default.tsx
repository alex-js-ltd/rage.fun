import { cookies } from 'next/headers'
import { Nav } from '@/app/comps/nav'
import { auth } from '@/app/auth'

export default async function Default() {
	const nonce = await getNonceFromCookie()
	const session = await auth()

	return <Nav nonce={nonce} session={session} />
}

async function getNonceFromCookie() {
	// cookies() is now async, so we await it
	const cookieStore = await cookies()

	// try both modern and legacy cookie names
	const raw = cookieStore.get('authjs.csrf-token')?.value ?? cookieStore.get('next-auth.csrf-token')?.value ?? ''

	// sometimes the value looks like "nonce|hash"
	const nonce = raw.split('|')[0] ?? ''

	return nonce
}
