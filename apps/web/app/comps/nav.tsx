'use client'

import Link from 'next/link'
import { Icon } from '@/app/comps/_icon'
import { Wallet } from './wallet'
import Image from 'next/image'
import { NavLink, type NavLinkProps } from './nav_link'
import { cn } from '@/app/utils/misc'

// Only the fields you put in NAV_ITEMS, plus label/icon
type NavItem = NavLinkProps & { label: string; icon: string }

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
		prefetch: false,
	},
] as const satisfies readonly NavItem[]

function Desktop() {
	return (
		<nav className="hidden sm:block sticky top-0 ">
			<div className="h-[52px] flex items-center w-full ">
				<Link
					href={{
						pathname: '/home',
					}}
					className="xl:ml-0 ml-auto w-[70px] h-[52px] flex items-center justify-center cursor-pointer"
				>
					<Image className="" src="/rage.png" alt="logo" width={56} height={56} preload={true} />
				</Link>
			</div>

			<div className="ml-auto xl:ml-0 w-[70px] xl:w-full items-center xl:items-start flex flex-col gap-1  h-[calc(100vh-52px)] pb-3">
				{NAV_ITEMS.map(l => (
					<NavLink
						key={l.href.pathname}
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
		</nav>
	)
}

function Mobile() {
	return (
		<nav className="sm:hidden h-[52px] fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[600px] w-full z-40 bg-background-100/75 backdrop-blur-md border-t border-white border-opacity-[0.125]">
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

export { Desktop, Mobile }
