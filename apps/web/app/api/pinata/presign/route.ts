import { type NextRequest, NextResponse } from 'next/server'
import { PinataSDK } from 'pinata'
import { getServerEnv } from '@/app/utils/env'

export const dynamic = 'force-dynamic'

export const runtime = 'nodejs' // important

const { PINATA_JWT, PROXY_PRIVATE_KEY } = getServerEnv()

const pinata = new PinataSDK({
	pinataJwt: PINATA_JWT,
	pinataGateway: 'indigo-adverse-vicuna-777.mypinata.cloud',
})

export async function GET() {
	// Handle your auth here to protect the endpoint
	try {
		const url = await pinata.upload.public.createSignedURL({
			expires: 30, // The only required param
			mimeTypes: ['image/*', 'image/gif'],
			maxFileSize: 5000000, // Optional file size limit
		})
		return NextResponse.json({ url: url }, { status: 200 }) // Returns the signed upload URL
	} catch (error) {
		console.log(error)
		return NextResponse.json({ text: 'Error creating signed URL:' }, { status: 500 })
	}
}
