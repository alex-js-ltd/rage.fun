'use client'

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/utils/misc'

const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.Trigger // Fix incorrect import name

const contentVariants = cva(undefined, {
	variants: {
		variant: {
			default: 'button px-3 h-[28px] rounded-full w-fit flex items-center justify-center text-text-100 gap-2 text-sm',
			sidebar: '',
		},
	},
	defaultVariants: {
		variant: 'default', // Default variant to prevent undefined class
	},
})

interface CollapsibleContentProps
	extends React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>,
		VariantProps<typeof contentVariants> {}

function CollapsibleContent({ variant, className, ref, ...props }: CollapsibleContentProps) {
	return (
		<CollapsiblePrimitive.CollapsibleContent
			className={cn(contentVariants({ variant, className }))}
			ref={ref}
			{...props}
		/>
	)
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
