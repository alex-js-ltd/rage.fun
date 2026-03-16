'use client'

import * as ToastPrimitive from '@radix-ui/react-toast'
import { cn } from '@/app/utils/misc'

export type ToastProps = ToastPrimitive.ToastProps & {
	description?: string
	className?: string
}

export function Toast({ open, onOpenChange, className, description, duration }: ToastProps) {
	return (
		<ToastPrimitive.Root
			open={open}
			onOpenChange={onOpenChange}
			duration={duration}
			className="data-[state=closed]:animate-swipeOut data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut relative z-50 transition-all data-[state=closed]:delay-[90000ms] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]"
		>
			<ToastPrimitive.Description
				className={cn(
					'text-text-100 overflow flex h-auto items-center rounded-md border-0 bg-white/10 p-4 text-xs whitespace-nowrap',
					className,
				)}
			>
				{description}
			</ToastPrimitive.Description>
		</ToastPrimitive.Root>
	)
}
