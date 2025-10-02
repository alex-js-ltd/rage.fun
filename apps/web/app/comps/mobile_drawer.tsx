'use client'

import { ReactNode } from 'react'
import { DialogRoot, DialogContent, DialogPortal, DialogTitle, DialogTrigger } from './dialog'
import { useWallet } from '@jup-ag/wallet-adapter'

export function MobileDrawer({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
	const { publicKey } = useWallet()
	return (
		<DialogRoot modal={false}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent
				className="absolute bottom-[52px] sm:bottom-0 w-full max-w-[600px] h-auto frost z-50 p-10"
				onInteractOutside={e => {
					if (!publicKey) {
						e.preventDefault()
					}
				}}
			>
				<DialogTitle className="sr-only">Drawer</DialogTitle>

				{children}
			</DialogContent>
		</DialogRoot>
	)
}
