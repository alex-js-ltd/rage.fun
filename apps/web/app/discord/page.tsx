// app/discord/page.tsx
import { Metadata } from 'next'
import { Redirect } from '@/app/comps/redirect'

export const metadata: Metadata = {
	title: 'letsrage.fun on Discord',
	description: 'Launch a token and trade with ZERO extraction.',
	openGraph: {
		title: 'letsrage.fun on Discord',
		description: 'Launch a token and trade with ZERO extraction.',
		images: [
			{
				url: 'https://letsrage.fun/rage.png',
				alt: 'letsrage.fun on Discord',
			},
		],
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'letsrage.fun on Discord',
		description: 'Launch a token and trade with ZERO extraction.',
		images: ['https://letsrage.fun/rage.png'],
	},
}

export default async function Page() {
	return <Redirect url="https://discord.gg/FfmuN25GjE" />
}
