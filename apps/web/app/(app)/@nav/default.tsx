import { cookies } from 'next/headers'
import { auth } from '@/app/auth'
import { SignInForm } from '@/app/comps/signin_form'
import Link from 'next/link'
import { Icon } from '@/app/comps/_icon'
import { Wallet } from '@/app/comps/wallet'
import Image from 'next/image'
import { type NavLinkProps } from '@/app/comps/nav_link'
import { ReactNode } from 'react'
import { NavLinks } from '@/app/comps/nav'

export default async function Default() {
	return (
		<>
			<Desktop>
				<NavLinks items={NAV_ITEMS} />
			</Desktop>
			<Mobile />
			<Auth />
		</>
	)
}
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
] as const satisfies NavItem[]

function Desktop({ children }: { children: ReactNode }) {
	return (
		<nav className="hidden sm:block sticky top-0 ">
			<div className="h-[52px] flex items-center w-full ">
				<Link
					href={{
						pathname: '/home',
					}}
					className="xl:ml-0 ml-auto w-[70px] h-[52px] flex items-center justify-center cursor-pointer"
				>
					<Image src="/rage.png" alt="logo" width={56} height={56} priority fetchPriority="high" />
				</Link>
			</div>

			<div className="ml-auto xl:ml-0 w-[70px] xl:w-full items-center xl:items-start flex flex-col gap-1  h-[calc(100vh-52px)] pb-3">
				{children}

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

async function getNonceFromCookie() {
	const cookieStore = await cookies()

	// Handle all modern + legacy cookie names
	const raw =
		cookieStore.get('__Host-authjs.csrf-token')?.value ??
		cookieStore.get('authjs.csrf-token')?.value ??
		cookieStore.get('next-auth.csrf-token')?.value ??
		''

	if (!raw) {
		console.warn('[auth] No CSRF token cookie found')
		return ''
	}

	// Sometimes cookie is "nonce|hash"
	const nonce = raw.split('|')[0] ?? ''
	return nonce
}

async function Auth() {
	const nonce = await getNonceFromCookie()
	const session = await auth()

	return session ? null : <SignInForm nonce={nonce} />
}
