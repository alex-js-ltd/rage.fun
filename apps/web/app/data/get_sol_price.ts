import { kv } from '@vercel/kv'

export async function getSolPrice<DataType>(): Promise<{ usd: number } | null> {
	try {
		const res = await kv.get<{ usd: number }>(`sol_price`)
		return res
	} catch (err) {
		console.error(`❌ Failed to fetch sol price`, err)
		return null
	}
}
