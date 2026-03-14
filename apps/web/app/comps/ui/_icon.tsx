import { type SVGProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/utils/misc'

const iconVariants = cva('inline self-center', {
	variants: {
		variant: {
			default: 'text-zinc-400',
			white: 'text-white',
		},
	},
})

export interface IconProps extends SVGProps<SVGSVGElement>, VariantProps<typeof iconVariants> {
	name: string
}

export function Icon({ className, variant, name, ...props }: IconProps) {
	return (
		<svg {...props} className={cn(iconVariants({ variant, className }))}>
			<use xlinkHref={`/icons.svg#${name}`} />
		</svg>
	)
}

Icon.displayName = 'Icon'
