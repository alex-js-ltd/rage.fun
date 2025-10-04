'use client'

import { ReactNode, useRef, useEffect, useState, useLayoutEffect } from 'react'
import { DialogRoot, DialogContent, DialogPortal, DialogTitle, DialogTrigger, DialogClose } from './dialog'
import { useMediaQuery, useScrollLock } from 'usehooks-ts'
import { Icon } from './_icon'
import { useSwipeable } from 'react-swipeable'

export function MobileDrawer({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
	const { lock, unlock } = useScrollLock({ autoLock: false })
	const [open, setOpen] = useState(false)

	function onOpenChange(next: boolean) {
		// keep the handler dumb: just update state
		setOpen(next)
	}

	useLayoutEffect(() => {
		// layout effect avoids a frame where the page can scroll before the lock applies
		if (open) lock()
		else unlock()

		return () => {
			// ensure we never leave the page locked on unmount
			unlock()
		}
	}, [open, lock, unlock])

	const matches = useMediaQuery('(min-width: 1040px)')

	useEffect(() => {
		if (matches) setOpen(false)
	}, [matches])

	const handlers = useSwipeable({
		onSwipedDown: () => {
			setOpen(false)
		},
		preventScrollOnSwipe: true,
		trackTouch: true,
		trackMouse: false,
	})

	return (
		<DialogRoot modal={false} open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent
				forceMount
				className="
fixed bottom-[0px] sm:bottom-0 w-full max-w-[600px] h-auto min-h-[381.5px] frost z-50 p-10
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

				<div
					{...handlers}
					onClick={() => setOpen(false)}
					className="
		absolute inset-x-0 top-0
		flex items-center justify-center py-2
		after:h-1.5 after:w-14 after:rounded-full after:bg-gray-300 cursor-pointer
		
	"
					data-modal-handle=""
				></div>

				<div className="max-w-[320px] grid mx-auto w-full">{children}</div>
			</DialogContent>
		</DialogRoot>
	)
}
