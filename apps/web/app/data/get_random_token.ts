import { Token } from '@prisma/client'
import { kv } from '@vercel/kv'
import 'server-only'

export async function getRandomToken() {
	const res = await kv.get<Token>('random_token')

	if (!res) {
		throw new Error('Failed to fetch random token')
	}

	return res
}
