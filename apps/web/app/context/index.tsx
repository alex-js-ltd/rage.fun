'use client'

import type { ReactNode } from 'react'
import { WalletProvider } from './wallet_context'
import { ToastProvider } from './toast_context'

import dynamic from 'next/dynamic'

const AblyProvider = dynamic(() => import('@/app/context/ably_context.tsx').then(mod => mod.RealTime), {
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
