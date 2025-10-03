'use client'

import { ReactNode, useRef, useEffect, useState } from 'react'
import { DialogRoot, DialogContent, DialogPortal, DialogTitle, DialogTrigger, DialogClose } from './dialog'
import { useMediaQuery } from 'usehooks-ts'
import { Icon } from './_icon'

export function MobileDrawer({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
	const matches = useMediaQuery('(min-width: 640px)')

	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (matches) {
			setOpen(false)
		}
	}, [matches])

	return (
		<DialogRoot modal={false} open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent
				className="absolute bottom-[52px] sm:bottom-0 w-full max-w-[600px] h-auto frost z-50 p-10 data-[state=open]:animate-slideFromBottom data-[state=close]:animate-slideToBottom"
				onInteractOutside={e => {
					const t = e.target as HTMLElement
					e.preventDefault()
				}}
			>
				<DialogTitle className="sr-only">Drawer</DialogTitle>

				<DialogClose asChild>
					<button className="absolute top-2 right-2 rounded-full hover:bg-white/10 flex items-center justify-center  p-1 size-[30px]">
						<Icon className="size-[20px] text-text-100 " name="close" />
					</button>
				</DialogClose>

				<div className="max-w-[320px] grid mx-auto w-full">{children}</div>
			</DialogContent>
		</DialogRoot>
	)
}
