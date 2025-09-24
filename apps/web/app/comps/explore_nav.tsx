'use client'

import { SearchParams } from '@/app/utils/schemas'
import Link from 'next/link'
import { cn } from '../utils/misc'

export function ExploreNav({ searchParams }: { searchParams: SearchParams }) {
	return (
		<div className="flex items-center w-full h-full overflow-x-scroll">
			<Link
				className={cn('relative h-full w-fit flex items-center px-6 hover:bg-white/10 whitespace-nowrap')}
				href={{
					pathname: `/home`,
					query: {
						sortType: 'createdAt',
					},
				}}
				replace
			>
				<span className="font-medium text-text-200 text-[15px]">Created At</span>

				<div
					className={cn(
						'absolute bottom-0 left-4 right-4 h-[1px]',
						searchParams.sortType === 'createdAt' && 'border-2 border-text-200 rounded',
					)}
				/>
			</Link>

			<Link
				className={cn('relative h-full w-fit flex items-center px-6 hover:bg-white/10 whitespace-nowrap')}
				href={{
					pathname: `/home`,
					query: {
						sortType: 'lastTrade',
					},
				}}
				replace
			>
				<span className="font-medium text-text-200 text-[15px]">Last Trade</span>

				<div
					className={cn(
						'absolute bottom-0 left-4 right-4 h-[1px]',
						searchParams.sortType === 'lastTrade' && 'border-2 border-text-200 rounded',
					)}
				/>
			</Link>

			<Link
				className={cn('relative h-full w-fit flex items-center px-6 hover:bg-white/10 whitespace-nowrap')}
				href={{
					pathname: `/home`,
					query: {
						sortType: 'marketCap',
					},
				}}
				replace
			>
				<span className="font-medium text-text-200 text-[15px]">Market Cap</span>

				<div
					className={cn(
						'absolute bottom-0 left-4 right-4 h-[1px]',
						searchParams.sortType === 'marketCap' && 'border-2 border-text-200 rounded',
					)}
				/>
			</Link>

			<Link
				className={cn('relative h-full w-fit flex items-center px-6 hover:bg-white/10')}
				href={{
					pathname: `/home`,
					query: {
						sortType: 'volume',
					},
				}}
				replace
			>
				<span className="font-medium text-text-200 text-[15px]">Volume</span>

				<div
					className={cn(
						'absolute bottom-0 left-4 right-4 h-[1px]',
						searchParams.sortType === 'volume' && 'border-2 border-text-200 rounded',
					)}
				/>
			</Link>
		</div>
	)
}
