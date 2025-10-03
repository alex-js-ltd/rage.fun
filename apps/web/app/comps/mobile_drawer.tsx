'use client'

import { ReactNode, useRef, useEffect, useState } from 'react'
import { DialogRoot, DialogContent, DialogPortal, DialogTitle, DialogTrigger, DialogClose } from './dialog'
import { useMediaQuery } from 'usehooks-ts'
import { Icon } from './_icon'

export function MobileDrawer({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
	const matches = useMediaQuery('(min-width: 1040px)')

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
				forceMount
				className="
fixed bottom-[0px] sm:bottom-0 w-full max-w-[600px] h-auto frost z-50 p-10
    transition-all  duration-300

    data-[state=open]:translate-y-0
    data-[state=open]:opacity-100

    data-[state=closed]:translate-y-full
    data-[state=closed]:opacity-0
    data-[state=closed]:pointer-events-none
  "
				onInteractOutside={e => {
					const t = e.target as HTMLElement
					e.preventDefault()
				}}
			>
				<DialogTitle className="sr-only">Drawer</DialogTitle>

				<DialogClose asChild className="data-[state=closed]:hidden">
					<button className="absolute top-2 right-2 rounded-full hover:bg-white/10 flex items-center justify-center  p-1 size-[30px]">
						<Icon className="size-[20px] text-text-100 " name="close" />
					</button>
				</DialogClose>

				<div className="max-w-[320px] grid mx-auto w-full">{children}</div>
			</DialogContent>
		</DialogRoot>
	)
}
