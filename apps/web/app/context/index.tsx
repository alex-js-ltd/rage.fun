'use client'

import { type ReactNode, use } from 'react'
import { ToastProvider } from './toast_context'
import { type Session } from 'next-auth'
import dynamic from 'next/dynamic'

const AuthProvider = dynamic(() => import('@/app/context/auth_context.tsx').then(mod => mod.AuthProvider), {
	ssr: false,
})

const AblyProvider = dynamic(() => import('@/app/context/ably_context.tsx').then(mod => mod.RealTime), {
	ssr: false,
})

const WalletProvider = dynamic(() => import('@/app/context/wallet_context.tsx').then(mod => mod.WalletProvider), {
	ssr: false,
})

export function AppProviders({
	sessionPromise,
	children,
}: {
	sessionPromise: Promise<Session | null>
	children: ReactNode
}) {
	const session = use(sessionPromise)
	return (
		<AuthProvider session={session} baseUrl="/api/auth">
			<WalletProvider>
				<AblyProvider>
					<ToastProvider>{children}</ToastProvider>
				</AblyProvider>
			</WalletProvider>
		</AuthProvider>
	)
}
