import { z } from 'zod'

const schema = z.object({
	NEXT_PUBLIC_CLUSTER: z.enum(['devnet', 'mainnet-beta'] as const),
	NEXT_PUBLIC_ENDPOINT: z.string(),

	PROXY_PRIVATE_KEY: z.string(),

	HELIUS_SECRET: z.string(),
	HELIUS_API_KEY: z.string(),

	KV_URL: z.string(),
	KV_REST_API_URL: z.string(),
	KV_REST_API_TOKEN: z.string(),

	ABLY_API_KEY: z.string(),

	PINATA_JWT: z.string(),

	DISCORD_WEBHOOK_URL: z.string(),

	TELEGRAM_BOT_TOKEN: z.string(),
	TELEGRAM_CHAT_ID: z.string(),
})

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof schema> {}
	}
}

export function init() {
	const parsed = schema.safeParse(process.env)

	if (parsed.success === false) {
		console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)

		throw new Error('Invalid envirmonment variables')
	}
	console.log(`✅ correct environemnt variables:`)
	console.log(`CLUSTER: ${parsed.data.NEXT_PUBLIC_CLUSTER}`)
}

/**
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
	return {
		CLUSTER: process.env.NEXT_PUBLIC_CLUSTER,
		ENDPOINT: process.env.NEXT_PUBLIC_ENDPOINT,
	}
}

export function getServerEnv() {
	return {
		PROXY_PRIVATE_KEY: process.env.PROXY_PRIVATE_KEY,

		HELIUS_SECRET: process.env.HELIUS_SECRET,
		HELIUS_API_KEY: process.env.HELIUS_API_KEY,

		KV_URL: process.env.KV_URL,
		KV_REST_API_URL: process.env.KV_REST_API_URL,
		KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,

		ABLY_API_KEY: process.env.ABLY_API_KEY,
		PINATA_JWT: process.env.PINATA_JWT,

		DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,

		TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
		TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
	}
}

type ENV = ReturnType<typeof getEnv>

declare global {
	var ENV: ENV
	interface Window {
		ENV: ENV
	}
}
