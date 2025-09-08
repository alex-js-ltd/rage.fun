'use client'

import React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

export function PopoverRoot({ children, ...props }: PopoverPrimitive.PopoverProps) {
	return <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>
}

export function PopoverTrigger({ children, ...props }: PopoverPrimitive.PopoverTriggerProps) {
	return <PopoverPrimitive.Trigger {...props}>{children}</PopoverPrimitive.Trigger>
}

export function PopoverContent({ children, ...props }: PopoverPrimitive.PopoverContentProps) {
	return <PopoverPrimitive.Content {...props}>{children}</PopoverPrimitive.Content>
}

export function PopoverPortal({ children, ...props }: PopoverPrimitive.PopoverPortalProps) {
	return <PopoverPrimitive.Portal {...props}>{children}</PopoverPrimitive.Portal>
}

export function PopoverAnchor({ children, ...props }: PopoverPrimitive.PopoverAnchorProps) {
	return <PopoverPrimitive.Anchor {...props}>{children}</PopoverPrimitive.Anchor>
}

export function PopoverArrow({ children, ...props }: PopoverPrimitive.PopoverArrowProps) {
	return <PopoverPrimitive.Arrow {...props}>{children}</PopoverPrimitive.Arrow>
}
