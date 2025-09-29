'use client'

import { type ReactNode, useMemo } from 'react'
import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter'
import { PhantomWalletAdapter, CoinbaseWalletAdapter, TrustWalletAdapter } from '@solana/wallet-adapter-wallets'
import { getEnv } from '@/app/utils/env'
import { authenticate, disconnect } from '@/app/actions/authenticate'
import { Adapter } from '@solana/wallet-adapter-base'
import { useIsMobile } from '@/app/hooks/use_is_mobile'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLatestRef } from '@/app/hooks/use_latest_ref'

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
					onConnect: onConnect,
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

	const pathname = usePathname()
	const searchParams = useSearchParams()

	const refUrl = useLatestRef(() => {
		const p = new URLSearchParams(searchParams)
		const url = `${pathname}?${p.toString()}`
		return url
	})

	async function onConnect({ publicKey }: { publicKey: string }) {
		if (!refUrl.current) return
		const url = refUrl.current()
		await authenticate(publicKey, url)
	}

	async function onDisconnect() {
		if (!refUrl.current) return
		const url = refUrl.current()
		await disconnect(url)
	}

	return <UnifiedWalletProvider {...params}>{children}</UnifiedWalletProvider>
}
