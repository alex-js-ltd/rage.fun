'use client'

import Link, { type LinkProps } from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export type NavLinkRenderProps = {
	isActive: boolean
}

export interface NavLinkProps extends Omit<LinkProps, 'className' | 'style' | 'children'> {
	children?: React.ReactNode | ((props: NavLinkRenderProps) => React.ReactNode)
	className?: string
	/** When true, ignore ?query when checking active (default: true) */
	ignoreSearch?: boolean
}

export function NavLink({ href, children, className, ...props }: NavLinkProps) {
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const url = searchParams.size === 0 ? pathname : props.ignoreSearch ? pathname : `${pathname}?${searchParams}`

	// Determine if the current URL matches the href
	const isActive = url === props.as

	let renderProps = {
		isActive,
	}

	return (
		<Link className={className} href={href} {...props}>
			{typeof children === 'function' ? children(renderProps) : children}
		</Link>
	)
}
