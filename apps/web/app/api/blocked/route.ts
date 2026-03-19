export const runtime = 'edge'

export async function GET(request: Request) {
	return new Response('Rate Limit Exceeded', { status: 429 })
}
