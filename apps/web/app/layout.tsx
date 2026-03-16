import { type Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'
import { AppProviders } from '@/app/context'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { auth } from '@/app/auth'
import Head from 'next/head'

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

export default function RootLayout(props: { children: ReactNode }) {
	const sessionPromise = auth()

	return (
		<html className={`${GeistSans.variable} ${GeistMono.variable}`} lang="en">
			<Head>
				<link rel="preload" href="/icons.svg" as="image" type="image/svg+xml" />
			</Head>
			<body className="dark scrollbar-hide max-h-[100vh] cursor-default font-sans">
				<div className="min-h-screen-patched bg-background-100 scrollbar-hide flex w-full flex-col">
					<Suspense fallback={null}>
						<AppProviders sessionPromise={sessionPromise}>{props.children}</AppProviders>
					</Suspense>
				</div>
				<Analytics />
			</body>
		</html>
	)
}
