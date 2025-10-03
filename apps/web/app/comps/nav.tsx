'use client'

import Link, { type LinkProps } from 'next/link'
import { Icon } from '@/app/comps/_icon'
import { Wallet } from './wallet'
import Image from 'next/image'

interface NavItemProps extends LinkProps {
	label: string
	icon: string
}

export function Nav() {
	const NAV_ITEMS = [
		{
			href: { pathname: '/home', query: {} },
			scroll: true,
			label: 'Home',
			icon: 'home',
		},
		{ href: { pathname: '/create', query: {} }, scroll: false, label: 'Create', icon: 'face-plus' },
		{
			href: { pathname: '/earn', query: {} },
			scroll: true,
			label: 'Earn',
			icon: 'dollar',
		},
	] as const satisfies readonly NavItemProps[]

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
										className="object-cove object-contain  "
									/>
								</div>
							</Link>
							{NAV_ITEMS.map(l => (
								<Link
									key={l.href.pathname}
									href={l.href}
									className="flex items-center gap-2 rounded-full hover:bg-white/10 w-fit h-[50.25px] p-3 "
									scroll={l.scroll}
								>
									<Icon className="size-6 text-text-200" name={l.icon} />

									<span className="hidden xl:block text-text-200 font-semibold text-lg">{l.label}</span>
								</Link>
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
    border-t border-white/10 bg-background/80 backdrop-blur
    [padding-bottom:max(0px,env(safe-area-inset-bottom))]"
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
