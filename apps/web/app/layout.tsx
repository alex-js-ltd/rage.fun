import { type Metadata } from 'next'
import { type ReactNode } from 'react'
import { AppProviders } from '@/app/context'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { auth } from '@/app/auth'
import { LinkDiscord } from './comps/link_discord'
import './globals.css'

export const metadata: Metadata = {
	title: {
		template: '%s | Lets Rage',
		default: 'Lets Rage',
	},
	description: 'Launch a token and trade with zero extraction.',
	metadataBase: new URL('https://www.letsrage.fun'),

	icons: [{ url: '/favicon.ico' }],
}

export default async function RootLayout(props: { children: ReactNode }) {
	const session = await auth()
	const id = session?.user?.id
	return (
		<html className={`${GeistSans.variable} ${GeistMono.variable}`} lang="en">
			<body className="font-sans max-h-[100vh] dark cursor-default scrollbar-hide">
				<div className="min-h-screen-patched flex flex-col w-full bg-background-100 scrollbar-hide">
					<AppProviders>
						{props.children}

						{id && <LinkDiscord />}
					</AppProviders>
				</div>
				<Analytics />
			</body>
		</html>
	)
}
