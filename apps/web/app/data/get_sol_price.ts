import { kv } from '@vercel/kv'

export async function getSolPrice<DataType>(): Promise<number> {
	const res = await kv.get<{ usd: number }>(`sol_price`)

	if (!res) {
		throw new Error('failed to fetch sol price')
	}
	return res.usd
}
