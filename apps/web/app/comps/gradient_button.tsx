import React from 'react'
import { Icon } from './_icon'
import { type ButtonProps, Button } from './button'

export function GradientButton({ children, ...rest }: ButtonProps) {
	return (
		<div className="group flex items-center gap-2 font-medium z-50 relative">
			<div className="relative m-0.5">
				<div className="absolute inset-[-2px] -z-10 flex items-center justify-center overflow-hidden rounded-full bg-red-500">
					<div
						className="min-h-40 min-w-40 animate-spin"
						style={{
							animationDuration: '6s',
							background: 'conic-gradient(from 0deg at 50% 50%, #67e8f9, #0891b2, #164e63, #0891b2, #67e8f9)',
						}}
					></div>
				</div>
				<Button
					{...rest}
					className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-background-100 text-text-100 shadow hover:bg-primary/90 py-2 h-8 rounded-full px-3 pr-1.5 group-hover:bg-primary/90 "
				>
					{children}
					<Icon className="ml-1 size-4" name="chevron-right" />
				</Button>
			</div>
		</div>
	)
}
