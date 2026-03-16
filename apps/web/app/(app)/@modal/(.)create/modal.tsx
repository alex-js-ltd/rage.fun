'use client'

import React, { type ReactNode, useRef, useEffect } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'

export function Modal(props: { children: React.ReactNode }) {
	const router = useRouter()

	function onOpenChange(open: boolean) {
		if (open) return

		if (window.history.length > 1) {
			router.back()
		} else {
			router.push('/home') // fallback page
		}
	}

	return (
		<DialogPrimitive.Root defaultOpen={true} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 bg-white/20 data-[state=open]:animate-overlayShow" />
				<DialogPrimitive.Content className="z-50 fixed left-1/2 top-0 max-h-[85vh] w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-0 rounded-md bg-gray1 pt-[52px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
					<DialogPrimitive.Title className="sr-only">Create</DialogPrimitive.Title>

					{props.children}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}
