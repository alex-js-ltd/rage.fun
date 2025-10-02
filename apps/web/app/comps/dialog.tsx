'use client'

import React, { type ReactNode, useRef, useEffect } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'

export function DialogRoot(props: DialogPrimitive.DialogProps) {
	return <DialogPrimitive.Root {...props} />
}

export function DialogTrigger(props: DialogPrimitive.DialogTriggerProps) {
	return <DialogPrimitive.Trigger {...props} />
}

export function DialogClose(props: DialogPrimitive.DialogCloseProps) {
	return <DialogPrimitive.Close {...props} />
}

export function DialogPortal(props: DialogPrimitive.DialogPortalProps) {
	return <DialogPrimitive.Portal {...props} />
}

export function DialogTitle(props: DialogPrimitive.DialogTitleProps) {
	return <DialogPrimitive.Title {...props} />
}

export function DialogContent(props: DialogPrimitive.DialogContentProps) {
	return <DialogPrimitive.Content {...props} />
}
