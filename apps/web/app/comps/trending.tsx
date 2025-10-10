'use client'
import { use, useState } from 'react'
import { TokenFeedType } from '@/app/utils/schemas'

import Image from 'next/image'
import Link from 'next/link'
import { createPngDataUri } from 'unlazy/thumbhash'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'

export function Trending({ trendingPromise }: { trendingPromise: Promise<TokenFeedType[]> }) {
	const data = use(trendingPromise)

	const [state, setState] = useState(data)

	const { channel } = useChannel('trendingEvent', (message: Ably.Message) => {
		const e: TokenFeedType[] = message.data

		setState(e)
	})

	return (
		<div className="border border-white border-opacity-[0.125] rounded-2xl w-full overflow-hidden">
			<div className="h-[48px] flex items-center px-3">
				<h2 className="text-white font-semibold text-[15px]">Trending</h2>
			</div>
			<ul className="grid">
				{state.map(t => (
					<li key={t.id} className="w-full hover:bg-white/10 h-[65.55px] px-3">
						<Link
							aria-label={`View ${t.metadata.name}`}
							href={{
								pathname: `/token/${t.id}`,
								query: { interval: '5m' },
							}}
							as={`/token/${t.id}?interval=5m`}
							scroll={true}
							className="flex items-center justify-between h-full"
						>
							<div className="relative size-[40px] rounded-full overflow-hidden">
								<Image
									src={t.metadata.image}
									alt={t.metadata.name}
									width={40}
									height={40}
									blurDataURL={createPngDataUri(t.metadata.thumbhash)}
									placeholder="blur"
								/>
							</div>

							<span className="text-text-100 text-sm">{t.metadata.symbol}</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
