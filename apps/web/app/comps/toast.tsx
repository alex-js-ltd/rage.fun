'use client'

import React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { cn } from '@/app/utils/misc'

export type ToastProps = ToastPrimitive.ToastProps & { description?: string; className?: string }

export function Toast({ open, onOpenChange, className, description, duration }: ToastProps) {
	return (
		<ToastPrimitive.Root
			open={open}
			onOpenChange={onOpenChange}
			duration={duration}
			className="relative z-50 transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:delay-[90000ms] data-[state=closed]:animate-swipeOut data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-[transform_200ms_ease-out]"
		>
			<ToastPrimitive.Description
				className={cn(
					'bg-background-200 text-text-100 border-0 overflow whitespace-nowrap text-xs h-auto flex items-center p-4 rounded-md',
					className,
				)}
			>
				{description}
			</ToastPrimitive.Description>
		</ToastPrimitive.Root>
	)
}
