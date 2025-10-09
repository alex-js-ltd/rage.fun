'use client'

import { UnifiedWalletButton, useUnifiedWallet } from '@jup-ag/wallet-adapter'
import { shortenWallet } from '@/app/utils/misc'
import { Icon } from './_icon'

import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent, PopoverAnchor, PopoverArrow } from './popover'

import { useAsync } from '@/app/hooks/use_async'

export function Wallet() {
	const { wallet, connected, publicKey, disconnect, connect } = useUnifiedWallet()

	const walletName = wallet?.adapter?.name // e.g. "Phantom", "Solflare"
	const walletIcon = wallet?.adapter?.icon // URL string (SVG/PNG

	const { run } = useAsync()

	if (!connected || !publicKey) {
		return (
			<UnifiedWalletButton
				overrideContent={
					<button className="relative h-auto sm:rounded-full xl:flex items-center p-3 xl:w-[165px] w-full justify-center font-semibold text-text-200 xl:border xl:border-white xl:border-opacity-[0.125] hover:bg-white/10">
						<span className="hidden xl:block">Connect</span>

						<Icon name="connect" className="size-6 xl:hidden " />
					</button>
				}
			></UnifiedWalletButton>
		)
	}

	return (
		<PopoverRoot>
			<PopoverTrigger className="sm:w-fit w-full">
				<div className="relative h-auto  xl:h-[65.55px] sm:rounded-full hover:bg-white/10 sm:w-fit flex items-center p-3 gap-3 justify-center">
					<img src={walletIcon} alt={walletName} className=" size-6 sm:size-10 rounded-full" />
					<span className="hidden xl:block text-sm text-text-200">{shortenWallet(publicKey?.toBase58())}</span>
					<Icon name="more-horizontal" className="hidden xl:block size-6 text-text-200 " />
				</div>
			</PopoverTrigger>

			<PopoverPortal>
				<PopoverContent
					className="w-fit z-50 h-[56px] p-4 rounded-xl border border-white/0 shadow-lg outline-none bg-white/10"
					side="top"
					align="center"
					sideOffset={4}
				>
					<button
						className="text-text-200"
						onClick={() => {
							const promise = disconnect()

							run(promise)
						}}
					>
						Disconnect
					</button>

					<PopoverArrow className="fill-white opacity-[0.125]" />
				</PopoverContent>
			</PopoverPortal>
		</PopoverRoot>
	)
}
