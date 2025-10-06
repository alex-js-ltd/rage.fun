// app/discord/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'letsrage.fun on Discord',
	description: 'Launch a token and trade with zero extraction.',
	openGraph: {
		title: 'letsrage.fun on Discord',
		description: 'Launch a token and trade with zero extraction.',
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
		description: 'Launch a token and trade with zero extraction.',
		images: ['https://letsrage.fun/rage.png'],
	},
}

export default function Page() {
	redirect('https://discord.gg/FfmuN25GjE')
}
