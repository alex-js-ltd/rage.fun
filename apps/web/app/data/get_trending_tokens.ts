import { type TokenTrending } from '@/app/api/cron/trending/route'
import { kv } from '@vercel/kv'
import 'server-only'

export async function getTrendingTokens(): Promise<TokenTrending[]> {
	const res = await kv.get<TokenTrending[]>('trending_tokens')

	if (!res) {
		return []
	}

	// Parse back the JSON string you stored earlier
	// const tokens = JSON.parse(res) as TokenFeedType[]

	return res
}
