'use client'

import Link, { type LinkProps } from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export type NavLinkRenderProps = {
	isActive: boolean
}

interface NavLinkProps
	extends Omit<LinkProps, 'className' | 'style' | 'children'> {
	children?: React.ReactNode | ((props: NavLinkRenderProps) => React.ReactNode)
	className?: string | ((props: NavLinkRenderProps) => string | undefined)
}

export function NavLink({ href, children, className, ...props }: NavLinkProps) {
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const url = `${pathname}?${searchParams}`

	// Determine if the current URL matches the href
	const isActive = url === href

	let renderProps = {
		isActive,
	}

	return (
		<Link href={href} {...props}>
			{typeof children === 'function' ? children(renderProps) : children}
		</Link>
	)
}
