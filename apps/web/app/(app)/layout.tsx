'use client'

import { usePathname, useSelectedLayoutSegment } from 'next/navigation'
import { cn } from '@/app/utils/misc'
import { Footer } from '@/app/comps/footer'

export default function Layout(props: {
	children: React.ReactNode
	nav: React.ReactNode
	right: React.ReactNode
	modal: React.ReactNode
	token: React.ReactNode
}) {
	const pathname = usePathname()

	const segment = useSelectedLayoutSegment()

	const isOnToken = pathname.startsWith('/token')

	const isOnCreate = pathname.startsWith('/create')

	const profile = segment && segment?.length > 20

	const isTokenFeed = segment === 'home' || segment === 'earn' || profile

	const hide = isOnToken && isTokenFeed

	console.log('seg', segment)

	return (
		<>
			<div className="flex justify-center">
				<div
					className={cn(
						'grid min-h-screen items-stretch',
						'[grid-template-columns:minmax(0,600px)]',
						'sm:[grid-template-columns:minmax(70px,70px)_minmax(0px,600px)]',
						'md:[grid-template-columns:minmax(70px,70px)_600px]',
						'lg:[grid-template-columns:minmax(0,259px)_600px_minmax(290px,350px)]',
						'xl:[grid-template-columns:minmax(0,259px)_600px_minmax(350px,350px)]',
					)}
				>
					{/* LEFT */}
					<aside className="z-50">{props.nav}</aside>

					{/* CENTER (your Page renders here) */}
					<main className={cn('relative w-full max-w-[600px] overflow-y-hidden')}>
						<div className={cn(hide && 'absolute top-0 overflow-y-hidden h-[100vh] opacity-0')}>{props.children}</div>

						<div className={cn('', isOnCreate && 'absolute top-0 inset-0')}>{props.token}</div>
					</main>

					{/* RIGHT — parent must stretch so sticky has room */}
					<aside className="hidden lg:block self-stretch">
						<div className="sticky top-0 px-4">
							<div className="relative h-[100vh] overflow-hidden">
								{props.right}

								<div className="absolute bottom-4 left-0">
									<Footer />
								</div>
							</div>
						</div>
					</aside>
				</div>
			</div>
			{props.modal}
		</>
	)
}
