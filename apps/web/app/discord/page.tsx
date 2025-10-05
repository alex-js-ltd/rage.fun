import { Metadata } from 'next'
import { redirect, RedirectType } from 'next/navigation'

export const metadata: Metadata = {
	title: 'letsrage.fun on Discord',
	description: 'Rage against the fee machine 🔥',
	openGraph: {
		title: 'letsrage.fun on Discord',
		description: 'Rage against the fee machine 🔥',
		images: [
			{
				url: 'https://letsrage.fun/rage.png', // Replace with your actual image URL
				alt: 'letsrage.fun on Discord',
			},
		],
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'letsrage.fun on Discord',
		description: 'Rage against the fee machine 🔥',
		images: ['https://magicmint.fun/rage.png'], // Replace with your actual image URL
	},
}

export default async function Page() {
	redirect('https://discord.gg/FfmuN25GjE')
}
