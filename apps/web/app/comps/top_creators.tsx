'use client'
import { use, useState } from 'react'
import { TokenFeedType } from '@/app/utils/schemas'

import Image from 'next/image'
import Link from 'next/link'
import { createPngDataUri } from 'unlazy/thumbhash'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'

import { Loading } from './loading'
import { shortAddress } from '../utils/misc'

export function TopCreators({
	topCreatorsPromise,
}: {
	topCreatorsPromise: Promise<{ user: { id: string }; yield: { uiAmount: string } }[]>
}) {
	const data = use(topCreatorsPromise)

	const [state, setState] = useState(data)

	return (
		<div className="border border-white border-opacity-[0.125] rounded-2xl w-full overflow-hidden">
			<div className="h-[48px] flex items-center px-3">
				<h2 className="text-white font-semibold text-[15px]">Top Creators</h2>
			</div>
			<ul className="grid">
				{state?.map(c => (
					<li key={c.user.id} className="w-full hover:bg-white/10 h-[65.55px] px-3">
						<Link
							className="flex items-center justify-between h-full"
							href={{
								pathname: `/${c.user.id}`,
							}}
							as={`/${c.user.id}`}
							scroll={true}
						>
							<div className="relative h-[40px] flex items-center ">
								<span className="font-medium text-text-200 text-sm">{shortAddress(c.user.id)}</span>
							</div>

							<span className="font-medium text-buy-100 text-sm">{`+$${c.yield.uiAmount}`}</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
export function TrendingFallBack() {
	return (
		<div className="border border-white border-opacity-[0.125] rounded-2xl w-full overflow-hidden">
			<div className="h-[48px] flex items-center px-3">
				<h2 className="text-white font-semibold text-[15px]">Trending</h2>
			</div>
			<ul className="grid">
				{[1, 2, 3].map(t => (
					<li key={t} className="w-full hover:bg-white/10 h-[65.55px] px-3">
						<div aria-label={`Loading View ${t}`} className="flex items-center justify-between h-full">
							<div className="relative size-[40px] rounded-full overflow-hidden">
								<Loading i={t} className="size-[40px]" />
							</div>

							<span className="text-text-100 text-sm">
								<Loading i={t} className="w-[40px] h-[20px] rounded-md" />
							</span>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
