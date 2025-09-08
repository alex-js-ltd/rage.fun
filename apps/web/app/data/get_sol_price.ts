import { CoinGeckoClient } from 'coingecko-api-v3'
import { unstable_cache } from 'next/cache'

export async function getSolPrice() {
	const client = new CoinGeckoClient({
		timeout: 10000,
		autoRetry: true,
	})

	const data = await client.simplePrice({
		ids: 'solana', // CoinGecko ID for Solana
		vs_currencies: 'usd', // Get price in USD
	})

	const solPrice = data.solana.usd

	return solPrice
}

export const getCachedSolPrice = unstable_cache(getSolPrice, ['sol-price-usd'], {
	revalidate: 300,
})
