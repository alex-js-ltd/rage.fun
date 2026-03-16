import { type Trending } from '@/app/api/cron/trending/route'
import { kv } from '@vercel/kv'
import 'server-only'

export async function getTrending(): Promise<Trending[]> {
	const res = await kv.get<Trending[]>('trending_tokens')

	if (!res) {
		return []
	}

	// Parse back the JSON string you stored earlier
	// const tokens = JSON.parse(res) as TokenFeedType[]

	return res
}
