'use client'

import { cn } from '@/app/utils/misc'
import { NavLink } from './nav_link'

export function ExploreNav() {
	return (
		<div className="flex items-center w-full h-full overflow-x-scroll scrollbar-hide">
			<NavLink
				className={cn('relative h-full w-fit flex items-center px-4 hover:bg-white/10 whitespace-nowrap')}
				href={{
					pathname: `/home`,
					query: {},
				}}
				as={`/home`}
				replace
			>
				{({ isActive }) => (
					<>
						<span className={cn('font-medium text-text-200 text-[15px]', isActive && 'text-white')}>Created At</span>

						<div
							className={cn('absolute bottom-0 left-4 right-4 h-[1px]', isActive && 'border-2 border-rage-100 rounded')}
						/>
					</>
				)}
			</NavLink>

			<NavLink
				className={cn('relative h-full w-fit flex items-center px-4 hover:bg-white/10 whitespace-nowrap')}
				href={{
					pathname: `/home`,
					query: {
						sortType: 'lastTrade',
					},
				}}
				as={`/home?sortType=lastTrade`}
				replace
			>
				{({ isActive }) => (
					<>
						<span className={cn('font-medium text-text-200 text-[15px]', isActive && 'text-white')}>Last Trade</span>

						<div
							className={cn('absolute bottom-0 left-4 right-4 h-[1px]', isActive && 'border-2 border-rage-100 rounded')}
						/>
					</>
				)}
			</NavLink>

			<NavLink
				className={cn('relative h-full w-fit flex items-center px-4 hover:bg-white/10 whitespace-nowrap')}
				href={{
					pathname: `/home`,
					query: {
						sortType: 'marketCap',
					},
				}}
				as={`/home?sortType=marketCap`}
				replace
			>
				{({ isActive }) => (
					<>
						<span className={cn('font-medium text-text-200 text-[15px]', isActive && 'text-white')}>Market Cap</span>

						<div
							className={cn('absolute bottom-0 left-4 right-4 h-[1px]', isActive && 'border-2 border-rage-100 rounded')}
						/>
					</>
				)}
			</NavLink>

			<NavLink
				className={cn('relative h-full w-fit flex items-center px-4 hover:bg-white/10 whitespace-nowrap')}
				href={{
					pathname: `/home`,
					query: {
						sortType: 'volume',
					},
				}}
				as={`/home?sortType=volume`}
				replace
			>
				{({ isActive }) => (
					<>
						<span className={cn('font-medium text-text-200 text-[15px]', isActive && 'text-white')}>Volume</span>

						<div
							className={cn('absolute bottom-0 left-4 right-4 h-[1px]', isActive && 'border-2 border-rage-100 rounded')}
						/>
					</>
				)}
			</NavLink>
		</div>
	)
}
