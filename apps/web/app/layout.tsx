import { type Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'
import { AppProviders } from '@/app/context'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { auth } from '@/app/auth'

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
	const sessionPromise = auth()

	return (
		<html className={`${GeistSans.variable} ${GeistMono.variable}`} lang="en">
			<body className="font-sans max-h-[100vh] dark cursor-default scrollbar-hide">
				<div className="min-h-screen-patched flex flex-col w-full bg-background-100 scrollbar-hide">
					<Suspense fallback={null}>
						<AppProviders sessionPromise={sessionPromise}>{props.children}</AppProviders>
					</Suspense>
				</div>
				<Analytics />
			</body>
		</html>
	)
}
