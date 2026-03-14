'use client'

import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/utils/misc'

function Tooltip({ children, ...props }: TooltipPrimitive.TooltipProps) {
	return (
		<TooltipPrimitive.Provider>
			<TooltipPrimitive.Root delayDuration={100} {...props}>
				{children}
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	)
}

const TooltipTrigger = TooltipPrimitive.Trigger

const tooltipContentVariants = cva(undefined, {
	variants: {
		variant: {
			submit_1:
				'data-[state=delayed-open]:data-[side=bottom]:animate-slide-up-and-fade data-[state=closed]:data-[side=bottom]:animate-slide-down-and-fade z-50 bg-background-200 shadow-lg text-white overflow-hidden rounded-md bg-primary px-[12px] h-[32px] text-sm flex items-center leading-none will-change-[transform,opacity] bg-background-200 cursor-default',
			submit_2:
				'data-[state=delayed-open]:data-[side=bottom]:animate-slide-up-and-fade data-[state=closed]:data-[side=bottom]:animate-slide-down-and-fade z-50 bg-background-200 shadow-lg text-white overflow-hidden rounded-md bg-primary px-[12px] h-[32px] text-sm flex items-center leading-none will-change-[transform,opacity] bg-background-200 cursor-default',
			submit_3:
				'data-[state=delayed-open]:data-[side=bottom]:animate-slide-up-and-fade data-[state=closed]:data-[side=bottom]:animate-slide-down-and-fade z-50 text-text-200 overflow-hidden rounded-md px-[12px] h-[32px] text-sm flex items-center leading-none will-change-[transform,opacity] cursor-default',
		},
	},
})

export interface TooltipContentProps
	extends React.ComponentProps<typeof TooltipPrimitive.Content>,
		VariantProps<typeof tooltipContentVariants> {
	children: React.ReactNode
}

function TooltipContent({ children, variant, className, ref, ...props }: TooltipContentProps) {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Content ref={ref} {...props} className={cn(tooltipContentVariants({ variant, className }))}>
				{children}
			</TooltipPrimitive.Content>
		</TooltipPrimitive.Portal>
	)
}

export { Tooltip, TooltipTrigger, TooltipContent }
