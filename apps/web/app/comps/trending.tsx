'use client'
import { use, useState } from 'react'

import { type TokenTrending } from '@/app/api/cron/trending/route'

import Image from 'next/image'
import Link from 'next/link'
import { createPngDataUri } from 'unlazy/thumbhash'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'

import { Loading } from './loading'
import { Icon } from './_icon'

export function Trending({ trendingPromise }: { trendingPromise: Promise<TokenTrending[]> }) {
	const data = use(trendingPromise)

	const [state, setState] = useState(data)

	const { channel } = useChannel('trendingEvent', (message: Ably.Message) => {
		const e: { tokens: TokenTrending[] } = message.data

		setState(e.tokens)
	})

	return (
		<div className="border border-white border-opacity-[0.125] rounded-2xl w-full overflow-hidden">
			<div className="h-[48px] flex items-center gap-1 px-3">
				<Icon name="cooking" className="size-4 text-text-100" />
				<h2 className="text-white font-semibold text-[15px]">Trending</h2>
			</div>
			<ul className="grid">
				{state.map(t => {
					return <ListItem key={t.id} token={t} />
				})}
			</ul>
		</div>
	)
}

function ListItem({ token }: { token: TokenTrending }) {
	const [src, setImgSrc] = useState(token.metadata.image)
	return (
		<li key={token.id} className="w-full hover:bg-white/10 h-[65.55px] px-3">
			<Link
				aria-label={`View ${token.id}`}
				href={{
					pathname: `/token/${token.id}`,
					query: { interval: '5m' },
				}}
				as={`/token/${token.id}?interval=5m`}
				scroll={true}
				className="flex items-center justify-between h-full"
			>
				<div className="relative size-[40px] rounded-full overflow-hidden">
					<Image
						src={src}
						alt={token.metadata.symbol}
						width={40}
						height={40}
						blurDataURL={createPngDataUri(token.metadata.thumbhash)}
						placeholder="blur"
						className="w-full h-full object-cover object-center"
						onError={() => {
							setImgSrc('/fallback.webp')
						}}
					/>
				</div>

				<span className="text-text-100 text-sm">{token.metadata.symbol}</span>
			</Link>
		</li>
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
