'use client'

import type { ReactNode } from 'react'
import { ToastProvider } from './toast_context'

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

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<WalletProvider>
			<AblyProvider>
				<ToastProvider>{children}</ToastProvider>
			</AblyProvider>
		</WalletProvider>
	)
}
