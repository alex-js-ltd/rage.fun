'use client'

import { SearchParams } from '@/app/utils/schemas'
import Link from 'next/link'
import { cn } from '../utils/misc'

export function ExploreNav({ searchParams }: { searchParams: SearchParams }) {
	return (
		<div className="flex items-center w-full h-full overflow-x-scroll scrollbar-hide">
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
				<span
					className={cn(
						'font-medium text-text-200 text-[15px]',
						searchParams.sortType === 'createdAt' && 'text-text-100',
					)}
				>
					Created At
				</span>

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
				<span
					className={cn(
						'font-medium text-text-200 text-[15px]',
						searchParams.sortType === 'lastTrade' && 'text-text-100',
					)}
				>
					Last Trade
				</span>

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
				<span
					className={cn(
						'font-medium text-text-200 text-[15px]',
						searchParams.sortType === 'marketCap' && 'text-text-100',
					)}
				>
					Market Cap
				</span>

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
				<span
					className={cn('font-medium text-text-200 text-[15px]', searchParams.sortType === 'volume' && 'text-text-100')}
				>
					Volume
				</span>

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
