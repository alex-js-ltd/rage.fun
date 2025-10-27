import { z } from 'zod'

const schema = z.object({
	NEXT_PUBLIC_CLUSTER: z.enum(['devnet', 'mainnet-beta'] as const),
	NEXT_PUBLIC_ENDPOINT: z.string(),
	NEXT_PUBLIC_BASE_URL: z.string(),

	PROXY_PRIVATE_KEY: z.string(),

	HELIUS_SECRET: z.string(),
	HELIUS_API_KEY: z.string(),

	RPC_URL: z.string(),

	KV_URL: z.string(),
	KV_REST_API_URL: z.string(),
	KV_REST_API_TOKEN: z.string(),

	ABLY_API_KEY: z.string(),

	PINATA_JWT: z.string(),

	CRON_SECRET: z.string(),

	AUTH_DISCORD_ID: z.string(),
	AUTH_DISCORD_SECRET: z.string(),

	DISCORD_BOT_TOKEN: z.string(),
	DISCORD_GUILD_ID: z.string(),
	DISCORD_CREATOR_ROLE_ID: z.string(),

	DISCORD_WEBHOOK_ALERT_URL: z.string(),
	DISCORD_WEBHOOK_CHAT_URL: z.string(),
	DISCORD_WEBHOOK_HARVEST_URL: z.string(),

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
		BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
	}
}

export function getServerEnv() {
	return {
		PROXY_PRIVATE_KEY: process.env.PROXY_PRIVATE_KEY,

		HELIUS_SECRET: process.env.HELIUS_SECRET,
		HELIUS_API_KEY: process.env.HELIUS_API_KEY,
		RPC_URL: process.env.RPC_URL,

		KV_URL: process.env.KV_URL,
		KV_REST_API_URL: process.env.KV_REST_API_URL,
		KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,

		ABLY_API_KEY: process.env.ABLY_API_KEY,
		PINATA_JWT: process.env.PINATA_JWT,

		CRON_SECRET: process.env.CRON_SECRET,

		AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
		AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,

		DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
		DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
		DISCORD_CREATOR_ROLE_ID: process.env.DISCORD_CREATOR_ROLE_ID,

		DISCORD_WEBHOOK_ALERT_URL: process.env.DISCORD_WEBHOOK_ALERT_URL,
		DISCORD_WEBHOOK_CHAT_URL: process.env.DISCORD_WEBHOOK_CHAT_URL,
		DISCORD_WEBHOOK_HARVEST_URL: process.env.DISCORD_WEBHOOK_HARVEST_URL,

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
