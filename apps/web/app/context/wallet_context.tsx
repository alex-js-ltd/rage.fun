'use client'

import { type ReactNode, useMemo } from 'react'
import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter'
import { PhantomWalletAdapter, CoinbaseWalletAdapter, TrustWalletAdapter } from '@solana/wallet-adapter-wallets'
import { getEnv } from '@/app/utils/env'
import { disconnect } from '@/app/actions/authenticate'
import { Adapter } from '@solana/wallet-adapter-base'
import { useIsMobile } from '@/app/hooks/use_is_mobile'

const { CLUSTER } = getEnv()

const noop = () => {}

type Params = Omit<Parameters<typeof UnifiedWalletProvider>[0], 'children'>

const metadata = {
	name: 'letsrage.fun',
	description: 'Take your trading fees back',
	url: 'https://letsrage.fun',
	iconUrls: ['https://www.letsrage.fun/favicon.ico'],
}

export function WalletProvider({ children }: { children: ReactNode }) {
	const isMobile = useIsMobile()

	const wallets: Adapter[] = useMemo(() => {
		if (typeof window === 'undefined') {
			return []
		}
		return [new PhantomWalletAdapter(), new CoinbaseWalletAdapter()].filter(
			item => item && item.name && item.icon,
		) as Adapter[]
	}, [])

	const params: Params = useMemo(
		() => ({
			wallets: wallets,
			config: {
				autoConnect: isMobile === false,
				env: CLUSTER,
				metadata: {
					name: metadata.name,
					description: metadata.description,
					url: metadata.url,
					iconUrls: metadata.iconUrls,
				},
				notificationCallback: {
					onConnect: noop,
					onConnecting: noop,
					onDisconnect: onDisconnect,
					onNotInstalled: noop,
				},

				theme: 'dark',
				lang: 'en',
			},
		}),
		[wallets, isMobile],
	)

	async function onDisconnect() {
		await disconnect()
	}

	return <UnifiedWalletProvider {...params}>{children}</UnifiedWalletProvider>
}
