import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/utils/misc'

const inputVariants = cva(undefined, {
	variants: {
		variant: {
			default:
				'min-h-[1.5rem] w-full flex-[1_0_50%] resize-none border-0 bg-background-200 pr-2 text-sm leading-relaxed text-white shadow-none outline-none ring-0 [scroll-padding-block:0.75rem] selection:bg-teal-300 selection:text-black placeholder:text-zinc-400 disabled:bg-transparent disabled:opacity-80 [&amp;_textarea]:px-0',
			amount:
				'h-[40px] pl-4 border-0 resize-none overflow-auto w-full flex-1 bg-transparent flex align-center text-base sm:text-sm outline-none ring-0 placeholder:text-text-300 text-text-300',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
})

export interface InputProps extends React.ComponentProps<'input'>, VariantProps<typeof inputVariants> {}

function Input({ className, type, variant, ref, ...props }: InputProps) {
	return (
		<input
			type={type}
			className={cn(inputVariants({ variant, className }))}
			ref={ref} // `ref` is now a regular prop
			{...props}
		/>
	)
}

Input.displayName = 'Input'

export { Input }
