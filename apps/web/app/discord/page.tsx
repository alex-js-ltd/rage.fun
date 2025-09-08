import { Metadata } from 'next'
import { redirect, RedirectType } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Join the magicmint.fun community!',
	description: 'Discuss meme coins, bonding curves, and magicmint.fun!',
	openGraph: {
		title: 'Join the magicmint.fun community 🫂',
		description: 'Where memes earn interest 🔥',
		images: [
			{
				url: 'https://magicmint.fun/discord-image.png', // Replace with your actual image URL
				width: 1200,
				height: 630,
				alt: 'Join Magic Mint Discord',
			},
		],
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Join the magicmint.fun community 🫂',
		description: 'Where memes earn interest 🔥',
		images: ['https://magicmint.fun/discord-image.png'], // Replace with your actual image URL
	},
}

export default async function Page() {
	redirect('https://discord.gg/F66a7SbBD8')
}
