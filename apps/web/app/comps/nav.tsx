'use client'

import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { Icon } from '@/app/comps/_icon'
import { Wallet } from './wallet'
import Image from 'next/image'
import { NavLink, type NavLinkProps } from './nav_link'
import { cn } from '@/app/utils/misc'
import { usePathname } from 'next/navigation'

// Only the fields you put in NAV_ITEMS, plus label/icon
type NavItem = NavLinkProps & { label: string; icon: string }

export function Nav() {
	const NAV_ITEMS = [
		{
			href: { pathname: '/home', query: {} },
			scroll: true,
			label: 'Home',
			icon: 'home',
			as: '/home',
			prefetch: true,
		},
		{
			href: { pathname: '/create' },
			scroll: false,
			label: 'Create',
			icon: 'face-plus',
			as: '/create',
			prefetch: true,
		},
		{
			href: { pathname: '/earn' },
			scroll: true,
			label: 'Earn',
			icon: 'dollar',
			as: '/earn',
			prefetch: true,
		},
	] as const satisfies readonly NavItem[]

	function Desktop() {
		return (
			<nav className="hidden sm:block sticky top-0">
				<div className="relative h-[52px] sm:h-[100vh] bg-black sm:w-full sm:bg-transparent w-[100vw] ">
					<div className="z-40 flex flex-col gap-1 sm:pb-4 sm:pt-[0px] h-full">
						<div className="sm:ml-auto flex sm:flex-col gap-1 w-full sm:w-[70px] items-center xl:w-full xl:items-start overflow-hidden h-full">
							<Link href={'/home'} className="flex items-center gap-2 rounded-full w-fit h-[50.25px] py-3 ">
								<div className="relative overflow-hidden h-[50.25px] w-[70px]">
									<Image
										src="/rage.png" // prefer SVG if you have it
										alt="RAGE"
										fill={true}
										priority
										className="object-contain"
									/>
								</div>
							</Link>
							{NAV_ITEMS.map(l => (
								<NavLink
									key={l.href.pathname}
									href={l.href}
									className="flex items-center gap-2 rounded-full hover:bg-white/10 w-fit h-[50.25px] p-3 text-text-200 hover:text-white "
									scroll={l.scroll}
									as={l.as}
									prefetch={l.prefetch}
								>
									{({ isActive }) => (
										<>
											<Icon className={cn('size-6', isActive && 'text-white')} name={l.icon} />

											<span className={cn('hidden xl:block  font-semibold text-lg', isActive && 'text-white')}>
												{l.label}
											</span>
										</>
									)}
								</NavLink>
							))}

							<div className="w-fit mt-auto">
								<Wallet />
							</div>
						</div>
					</div>
				</div>
			</nav>
		)
	}

	function Mobile() {
		return (
			<nav
				className="sm:hidden h-[52px]
    fixed bottom-0 left-1/2 -translate-x-1/2
    max-w-[600px] w-full z-40
    bg-background-100/75 backdrop-blur-md border-t border-white border-opacity-[0.125]
    "
			>
				<div className="flex gap-1 w-full items-center justify-between">
					{NAV_ITEMS.map(l => (
						<Link
							key={l.href.pathname}
							href={l.href}
							className="flex-1 flex items-center gap-2 justify-center  hover:bg-white/10 w-fit h-[50.25px] py-3 "
							scroll={l.scroll}
						>
							<Icon className="size-6 text-text-200" name={l.icon} />
						</Link>
					))}

					<div className="flex-1 items-center justify-center w-full">
						<Wallet />
					</div>
				</div>
			</nav>
		)
	}

	return (
		<>
			<Desktop />
			<Mobile />
		</>
	)
}
