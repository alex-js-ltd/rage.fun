import { cn } from '@/app/utils/misc'

export interface LoadingProps extends React.ComponentProps<'div'> {
	i: number
}

export function Loading({ i, className, children }: LoadingProps) {
	return (
		<div
			aria-label="Loading..."
			role="status"
			data-visualcompletion="loading-state"
			className={cn(
				'w-full h-full animate-glimmer',
				'[animation-delay:var(--animationDelay)]',
				'[animation-direction:var(--glimmer-animation-direction)]',
				'[animation-duration:var(--glimmer-animation-duration)]',
				'[animation-timing-function:var(--glimmer-animation-timing-function)]',
				'[opacity:var(--glimmer-opacity-min)]',
				'[background-color:var(--glimmer-base-opaque)]',
				'outline-none',
				className,
			)}
			tabIndex={-1}
			style={
				{
					'--animationDelay': `calc(${i} * var(--glimmer-stagger-time, 200ms))`,
				} as React.CSSProperties
			}
		>
			{children}
		</div>
	)
}
