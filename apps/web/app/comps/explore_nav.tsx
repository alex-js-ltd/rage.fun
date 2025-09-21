'use client'

import { Select, SelectContent, SelectItem } from '@/app/comps/select'
import { useChangeSearchParams } from '@/app/hooks/use_change_search_params'

import { SearchField } from './search'
import { Icon } from './_icon'
import { Checkbox } from './checkbox'
import { SearchParams } from '@/app/utils/schemas'
import { NavLink } from './nav_link'
import Link from 'next/link'
import { cn } from '../utils/misc'

export function ExploreNav({ searchParams }: { searchParams: SearchParams }) {
	return (
		<div className="flex items-center w-full h-full">
			<Link
				className={cn('relative h-full w-fit flex items-center px-6 hover:bg-white/10')}
				href={{
					pathname: `/home`,
					query: {
						sortType: 'createdAt',
						sortOrder: searchParams.sortOrder,
						query: '',
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
				className={cn('relative h-full w-fit flex items-center px-6 hover:bg-white/10')}
				href={{
					pathname: `/home`,
					query: {
						sortType: 'lastTrade',
						sortOrder: searchParams.sortOrder,
						query: '',
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
				className={cn('relative h-full w-fit flex items-center px-6 hover:bg-white/10')}
				href={{
					pathname: `/home`,
					query: {
						sortType: 'volume',
						sortOrder: searchParams.sortOrder,
						query: '',
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
