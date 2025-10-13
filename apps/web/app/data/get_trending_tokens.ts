import { TokenFeedType } from '@/app/utils/schemas'
import { kv } from '@vercel/kv'
import 'server-only'

export async function getTrendingTokens(): Promise<TokenFeedType[]> {
	const res = await kv.get<TokenFeedType[]>('trending_tokens')

	if (!res) {
		return []
	}

	// Parse back the JSON string you stored earlier
	// const tokens = JSON.parse(res) as TokenFeedType[]

	return res
}
