import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import React from 'react'

export function ScrollArea({ children }: { children: React.ReactNode }) {
	return (
		<ScrollAreaPrimitive.Root className="h-[100vh] w-[full] overflow-hidden">
			<ScrollAreaPrimitive.Viewport className="size-full">{children}</ScrollAreaPrimitive.Viewport>
			<ScrollAreaPrimitive.Scrollbar
				className="flex touch-none select-none bg-blackA3 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
				orientation="vertical"
			>
				<ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-[10px] bg-mauve10 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2" />
			</ScrollAreaPrimitive.Scrollbar>
			<ScrollAreaPrimitive.Scrollbar
				className="flex touch-none select-none bg-blackA3 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
				orientation="horizontal"
			>
				<ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-[10px] bg-mauve10 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-[44px] before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2" />
			</ScrollAreaPrimitive.Scrollbar>
			<ScrollAreaPrimitive.Corner className="bg-blackA5" />
		</ScrollAreaPrimitive.Root>
	)
}
