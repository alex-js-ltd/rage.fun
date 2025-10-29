import { WasmType } from '@/app/utils/schemas'
import { client } from '@/app/utils/client'

import { getEnv } from '@/app/utils/env'

const { BASE_URL } = getEnv()

export async function calculateBuyAmount(params: WasmType): Promise<string> {
	return client<string>(`${BASE_URL}/api/wasm/calculate_buy_amount`, {
		method: 'POST',
		body: JSON.stringify(params),
		headers: {
			'Content-Type': 'application/json',
		},
		cache: 'no-store',
	})
}

export async function calculateSellPrice(params: WasmType): Promise<string> {
	return client<string>(`${BASE_URL}/api/wasm/calculate_sell_price`, {
		method: 'POST',
		body: JSON.stringify(params),
		headers: {
			'Content-Type': 'application/json',
		},
		cache: 'no-store',
	})
}
