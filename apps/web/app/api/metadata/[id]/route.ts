import { type NextRequest, NextResponse } from 'next/server'
import { getCachedTokenMetadata } from '@/app/data/get_token_metadata'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	const { id: mint } = await props.params

	if (!mint) {
		return NextResponse.json({ error: 'missing mint param' }, { status: 400 })
	}

	const token = await getCachedTokenMetadata(mint)

	if (!token) {
		return NextResponse.json({ error: 'failed to retrieve token metadata' }, { status: 500 })
	}

	let { name, symbol, description, image } = token

	const response = NextResponse.json({ name, symbol, description, image })

	const origin = req.headers.get('origin') || ''
	console.log('Incoming Request Origin:', origin)

	response.headers.set('Access-Control-Allow-Origin', '*') // Allow all origins
	response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
	response.headers.set('Cache-Control', 'no-store')

	return response
}
