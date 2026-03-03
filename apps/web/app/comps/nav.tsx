'use client'

import { Icon } from '@/app/comps/_icon'
import { NavLink, type NavLinkProps } from './nav_link'
import { cn } from '@/app/utils/misc'

export function NavLinks({ items }: { items: Array<NavLinkProps & { label: string; icon: string }> }) {
	return (
		<>
			{items.map(l => (
				<NavLink
					key={l.label}
					href={l.href}
					className={cn(
						'flex items-center gap-2 rounded-full hover:bg-white/10 w-fit h-[50.25px] p-3 text-text-200 hover:text-white ',
					)}
					scroll={l.scroll}
					as={l.as}
					prefetch={l.prefetch}
				>
					{({ isActive }) => (
						<>
							<Icon className={cn('size-6', isActive && 'text-white')} name={l.icon} />
							<span className={cn('hidden xl:block  font-semibold text-lg', isActive && 'text-white')}>{l.label}</span>
						</>
					)}
				</NavLink>
			))}
		</>
	)
}
