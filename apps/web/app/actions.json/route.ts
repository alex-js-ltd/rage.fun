import { createActionHeaders, type ActionsJson } from '@solana/actions'

export async function GET() {
	const payload: ActionsJson = {
		rules: [
			// map all root level routes to an action
			{
				pathPattern: '/*',
				apiPath: '/api/buy/*',
			},
			// idempotent rule as the fallback
			{
				pathPattern: '/api/buy/**',
				apiPath: '/api/buy/**',
			},

			{
				pathPattern: '/api/dialect/buy/*',
				apiPath: '/api/dialect/buy/**',
			},

			{
				pathPattern: '/api/dialect/buy/**',
				apiPath: '/api/dialect/buy/**',
			},

			{
				pathPattern: '/api/dialect/sell/*',
				apiPath: '/api/dialect/sell/*',
			},

			{
				pathPattern: '/api/dialect/sell/**',
				apiPath: '/api/dialect/sell/**',
			},
		],
	}

	return Response.json(payload, {
		headers: createActionHeaders(),
	})
}

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET
