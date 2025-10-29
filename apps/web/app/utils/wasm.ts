import { WasmType } from '@/app/utils/schemas'
import { client } from '@/app/utils/client'

export async function calculateBuyAmount(params: WasmType): Promise<string> {
	return client<string>(`/api/wasm/calculate_buy_amount`, {
		method: 'POST',
		body: JSON.stringify(params),
		headers: {
			'Content-Type': 'application/json',
		},
		cache: 'no-store',
	})
}

export async function calculateSellPrice(params: WasmType): Promise<string> {
	return client<string>(`/api/wasm/calculate_sell_price`, {
		method: 'POST',
		body: JSON.stringify(params),
		headers: {
			'Content-Type': 'application/json',
		},
		cache: 'no-store',
	})
}
