'use client'

import { cn } from '@/app/utils/misc'
import { NavLink } from './nav_link'

export function ExploreNav() {
	return (
		<div className="flex items-center w-full h-full overflow-x-scroll scrollbar-hide">
			<NavLink
				className={cn(
					'flex-1 relative h-full w-fit flex items-center justify-center px-4 hover:bg-white/10 whitespace-nowrap',
				)}
				href={{
					pathname: `/home`,
					query: { sortType: '' },
				}}
				as={`/home`}
				replace
				prefetch={true}
			>
				{({ isActive }) => (
					<div className="relative w-fit h-full flex items-center">
						<span className={cn('font-medium text-text-200 text-[15px]', isActive && 'text-white')}>Created At</span>

						<div
							className={cn('absolute bottom-0 left-0 right-0 h-[1px]', isActive && 'border-2 border-rage-100 rounded')}
						/>
					</div>
				)}
			</NavLink>

			<NavLink
				className={cn(
					'flex-1 relative h-full w-fit flex items-center justify-center px-4 hover:bg-white/10 whitespace-nowrap',
				)}
				href={{
					pathname: `/home`,
					query: {
						sortType: 'lastTrade',
					},
				}}
				as={`/home?sortType=lastTrade`}
				replace
				prefetch={true}
			>
				{({ isActive }) => (
					<div className="relative w-fit h-full flex items-center">
						<span className={cn('font-medium text-text-200 text-[15px]', isActive && 'text-white')}>Last Trade</span>

						<div
							className={cn('absolute bottom-0 left-0 right-0 h-[1px]', isActive && 'border-2 border-rage-100 rounded')}
						/>
					</div>
				)}
			</NavLink>

			<NavLink
				className={cn(
					'flex-1 relative h-full w-fit flex items-center justify-center px-4 hover:bg-white/10 whitespace-nowrap ',
				)}
				href={{
					pathname: `/home`,
					query: {
						sortType: 'marketCap',
					},
				}}
				as={`/home?sortType=marketCap`}
				replace
				prefetch={true}
			>
				{({ isActive }) => (
					<div className="relative w-fit h-full flex items-center">
						<span className={cn('font-medium text-text-200 text-[15px]', isActive && 'text-white')}>Market Cap</span>

						<div
							className={cn('absolute bottom-0 left-0 right-0 h-[1px]', isActive && 'border-2 border-rage-100 rounded')}
						/>
					</div>
				)}
			</NavLink>
		</div>
	)
}
