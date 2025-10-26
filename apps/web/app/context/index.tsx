'use client'

import type { ReactNode } from 'react'
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

export function AppProviders({ session, children }: { session: Session | null; children: ReactNode }) {
	return (
		<AuthProvider session={session}>
			<WalletProvider>
				<AblyProvider>
					<ToastProvider>{children}</ToastProvider>
				</AblyProvider>
			</WalletProvider>
		</AuthProvider>
	)
}
