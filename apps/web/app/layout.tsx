import { type Metadata } from 'next'
import { type ReactNode } from 'react'
import { AppProviders } from '@/app/context'
import { Footer } from '@/app/comps/footer'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ScrollArea } from '@/app/comps/scroll_area'
import './globals.css'

export const metadata: Metadata = {
	title: {
		template: '%s | Magic Mint',
		default: 'Magic Mint',
	},
	description: 'Launch a token with one click and earn interest',
	metadataBase: new URL('https://www.magicmint.fun'),
}

export default async function RootLayout(props: { children: ReactNode }) {
	return (
		<html className={`${GeistSans.variable} ${GeistMono.variable}`} lang="en">
			<body className="font-sans max-h-[100vh] dark cursor-default scrollbar-hide">
				<div className="min-h-screen-patched flex flex-col w-full bg-background-100 scrollbar-hide">
					<AppProviders>
						{props.children}

						<Footer />
					</AppProviders>
				</div>
				<Analytics />
			</body>
		</html>
	)
}
