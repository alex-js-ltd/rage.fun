'use client'
import { use, useState } from 'react'
import { TokenFeedType } from '@/app/utils/schemas'

import Image from 'next/image'

export function Trending({ trendingPromise }: { trendingPromise: Promise<TokenFeedType[]> }) {
	const data = use(trendingPromise)

	const [state, setState] = useState(data)
	console.log('trending', state)

	return (
		<div className="hidden border border-white border-opacity-[0.125] rounded-2xl w-full overflow-hidden">
			<ul className="grid gap-4 ">
				{state.map(t => (
					<li key={t.id} className="flex justify-between hover:bg-white/10 px-3 py-3">
						<div className="relative size-[40px] rounded-full overflow-hidden">
							<Image src={t.metadata.image} alt={t.metadata.name} width={40} height={40} />
						</div>

						<span className="text-text-100">{t.metadata.symbol}</span>
					</li>
				))}
			</ul>
		</div>
	)
}
