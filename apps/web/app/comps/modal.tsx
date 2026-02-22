'use client'

import React, { type ReactNode, useRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { useSwipeable } from 'react-swipeable'
import { cn } from '@/app/utils/misc'
import { useParams } from 'next/navigation'

interface ModalProps {
	children: ReactNode
}

export function Modal({ children }: ModalProps) {
	const router = useRouter()

	const { id: mint } = useParams<{ id: string }>()

	const timerRef = useRef<NodeJS.Timeout | null>(null) // Best practice

	function onOpenChange(open: boolean) {
		if (open) return

		timerRef.current = setTimeout(() => {
			router.back()
		}, 500)
	}

	const ref = useRef<HTMLButtonElement>(null)

	const handlers = useSwipeable({
		onSwipedDown() {
			if (ref.current) {
				ref.current.click()
			}
		},
		delta: 50,
	})

	return (
		<DialogPrimitive.Root defaultOpen onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal container={document.getElementById('modal')}>
				<DialogPrimitive.Overlay className="z-50 fixed inset-0" />
				<DialogPrimitive.Content
					aria-describedby={`token modal`}
					className={cn(
						'data-[state=open]:animate-slideFromBottom data-[state=closed]:animate-slideToBottom z-50 h-auto fixed left-1/2 -translate-x-1/2 bottom-0 w-full max-w-5xl sm:px-6 px-0 grid mx-auto overflow-hidden',
					)}
					onOpenAutoFocus={e => {
						e.preventDefault()
					}}
				>
					<div className="frost mx-auto rounded-t-xl w-full" {...handlers}>
						<DialogPrimitive.Close className="sr-only" ref={ref} />
						{children}
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}

export const Title = DialogPrimitive.Title
