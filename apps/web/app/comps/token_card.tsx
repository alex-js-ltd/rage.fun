'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

import { Icon } from './_icon'
import Image from 'next/image'
import { cn, formatNumberSmart } from '@/app/utils/misc'
import { Loading } from './loading'
import { createPngDataUri } from 'unlazy/thumbhash'
import { SquareProgress } from './square_progress'
import { shortAddress } from '@/app/utils/misc'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/comps/tooltip'
import { type TokenCard } from '@/app/data/get_token_feed'

import { Blink } from './blink'
import { HarvestYieldForm } from './harvest_yield_form'

type TokenCardProps = {
	token: TokenCard
	action?: React.ReactNode
	link?: React.ReactNode
}

function TokenCard({ token, action, link }: TokenCardProps) {
	const {
		id: mint,

		metadata: { name, symbol, image, thumbhash },
		bondingCurve: { updatedAt, progress },
		marketData: { price, marketCap, liquidity, volume, buyCount, sellCount },
		updateType,
	} = token

	const prevUpdatedAtRef = useRef(updatedAt)

	const [animate, setAnimate] = useState(false)

	useEffect(() => {
		if (updatedAt !== prevUpdatedAtRef.current) {
			prevUpdatedAtRef.current = updatedAt
			// restart animation even if previous one is mid-flight
			setAnimate(false)
			requestAnimationFrame(() => setAnimate(true))
		}
	}, [updatedAt])

	const buyWave = cn(
		'absolute inset-0 z-20 pointer-events-none overflow-hidden bg-transparent',
		'before:pointer-events-none before:absolute before:inset-0',
		'before:bg-gradient-to-r before:from-transparent before:via-teal-300/10 before:to-transparent',
		'before:animate-wave-once',
	)

	const sellWave = cn(
		'absolute inset-0 z-20 pointer-events-none overflow-hidden bg-transparent',
		'before:pointer-events-none before:absolute before:inset-0',
		'before:bg-gradient-to-r before:from-transparent before:via-red-300/10 before:to-transparent',
		'before:animate-wave-once',
	)

	const [src, setImgSrc] = useState(image)

	return (
		<article className="group relative flex flex-col w-full h-full min-h-[178px] border-b border-white border-opacity-[0.125] hover:bg-white/10 bg-background-100">
			<div
				onAnimationEnd={() => setAnimate(false)}
				className={cn(
					'absolute inset-0',
					updateType === 'Buy' && animate && buyWave,
					updateType === 'Sell' && animate && sellWave,
				)}
			/>

			<div className="relative p-4 flex flex-col gap-4 ">
				<div className="flex gap-4">
					<div className="flex flex-col items-center gap-[4px]">
						<SquareProgress progress={progress} size={74}>
							<Link
								className="w-[72px] h-[72px] cursor-pointer relative rounded-md overflow-hidden flex-shrink-0"
								aria-label={`View ${name}`}
								href={{
									pathname: `/token/${mint}`,
									query: { interval: '1m' },
								}}
								as={`/token/${mint}?interval=1m`}
								scroll={true}
								prefetch={false}
							>
								<Image
									src={`${src}`}
									alt={`${name}`}
									className="object-cover object-center w-full h-full z-0"
									fill={true}
									blurDataURL={createPngDataUri(thumbhash)}
									placeholder="blur"
									sizes="(min-width: 1280px) 14vw, (min-width: 1024px) 16vw, (min-width: 768px) 20vw, (min-width: 640px) 25vw, 33vw"
									onError={() => {
										setImgSrc('/fallback.webp')
									}}
								/>
							</Link>
						</SquareProgress>

						<span className="text-xs text-text-200 font-medium">{shortAddress(mint)}</span>
					</div>

					<div className="flex flex-col gap-2 w-full">
						<div className="flex items-center gap-2">
							<span className="text-[16px] font-medium text-text-100 w-fit">{symbol}</span>
							<span className="text-white">|</span>
							<span className="text-[14px] font-medium text-text-200 w-fit">{name}</span>
						</div>

						<div className="flex items-center gap-1">
							<span className="text-xs text-text-200 font-medium">MC</span>
							<span className="text-rage-100 font-medium font-mono text-[15px]">{`$${formatNumberSmart(marketCap)}`}</span>
						</div>

						{link}
					</div>
				</div>

				<div className="flex gap-2 items-center flex-wrap sm:h-[32px]">
					<div className="flex gap-0 items-center flex-wrap border border-white border-opacity-[0.05] rounded-full px-1 py-1">
						<Pill label="P" value={`$${formatNumberSmart(price)}`} tooltip="Price" />
						<Pill label="L" value={`$${formatNumberSmart(liquidity)}`} tooltip="Liquidity" />
						<Pill label="V" value={`$${formatNumberSmart(volume)}`} tooltip="Volume" />

						<Pill
							label={''}
							value={
								<div className="flex gap-2">
									<div className="text-buy-100 text-xs">{buyCount}</div> /{' '}
									<div className="text-sell-100 text-xs">{sellCount}</div>
								</div>
							}
							tooltip="TXNS"
						/>
					</div>

					<div className="flex-1 xxs:justify-end items-center flex">{action}</div>
				</div>
			</div>
		</article>
	)
}

type PillProps = {
	label: React.ReactNode
	value: React.ReactNode
	tooltip?: React.ReactNode
	className?: string
}
export function Pill({ label, value, tooltip, className }: PillProps) {
	const body = (
		<div className={`flex py-1 px-[8px] rounded-full w-fit hover:bg-background-100 ${className ?? ''}`}>
			<div className="flex gap-1">
				<span className="text-xs text-text-200">{label}</span>
				<span className="text-xs text-text-200">{value}</span>
			</div>
		</div>
	)

	if (!tooltip) return body

	return (
		<Tooltip>
			<TooltipTrigger asChild>{body}</TooltipTrigger>
			<TooltipContent side="bottom" sideOffset={4} className="bg-background-100 rounded-sm p-1 text-text-200 text-xs">
				{tooltip}
			</TooltipContent>
		</Tooltip>
	)
}

export function TokenCardFallback({ i, children }: { i: number; children?: React.ReactNode }) {
	return (
		<article className="group relative flex flex-col w-full h-full min-h-[178px] border-b border-white border-opacity-[0.125] hover:bg-white/10 bg-background-100">
			<div className="relative p-4 flex flex-col gap-4 ">
				<div className="flex gap-4">
					<div className="flex flex-col items-center gap-[4px]">
						<SquareProgress progress={0} size={74}>
							<Loading
								className="w-[72px] h-[72px] cursor-pointer relative rounded-md overflow-hidden flex-shrink-0"
								i={0}
							></Loading>
						</SquareProgress>

						<span className="text-xs text-text-200 font-medium">
							<Loading
								className="w-[72px] h-[10px] cursor-pointer relative rounded-full overflow-hidden flex-shrink-0"
								i={1}
							></Loading>
						</span>
					</div>

					<div className="flex flex-col gap-2 w-full">
						<div className="text-[16px] font-medium text-text-100 w-full">
							<Loading
								className="w-[72px] h-[24px] cursor-pointer relative rounded-full overflow-hidden flex-shrink-0"
								i={2}
							></Loading>
						</div>

						<div className="flex items-center gap-1">
							<span className="text-rage-100 font-medium font-mono text-[15px]">
								<Loading
									className="w-[72px] h-[22px] cursor-pointer relative rounded-full overflow-hidden flex-shrink-0"
									i={3}
								></Loading>
							</span>
						</div>
					</div>
				</div>

				<div className="flex gap-2 items-center flex-wrap sm:h-[32px]">
					<div className="flex gap-1 items-center flex-wrap border border-white border-opacity-[0.05] rounded-full px-1 py-1">
						<Loading
							className="w-[60px] h-[16px] cursor-pointer relative rounded-md overflow-hidden flex-shrink-0"
							i={4}
						></Loading>

						<Loading
							className="w-[60px] h-[16px] cursor-pointer relative rounded-md overflow-hidden flex-shrink-0"
							i={5}
						></Loading>

						<Loading
							className="w-[60px] h-[16px] cursor-pointer relative rounded-md overflow-hidden flex-shrink-0"
							i={6}
						></Loading>

						<Loading
							className="w-[60px] h-[16px] cursor-pointer relative rounded-md overflow-hidden flex-shrink-0"
							i={7}
						></Loading>
					</div>

					<div className="flex-1 xxs:justify-end items-center flex">{children ? children : null}</div>
				</div>
			</div>
		</article>
	)
}

function Fallback({ count = 12, isEarnPage }: { count?: number; isEarnPage?: boolean }) {
	return (
		<>
			{Array.from({ length: count }, (_, i) => (
				<li key={`loading-card-${i}`} className="space-y-4 w-full">
					<TokenCardFallback i={i}>
						{isEarnPage ? (
							<Loading className="w-[74px] h-[34px] rounded-full" i={i} />
						) : (
							<Loading className="w-[120px] h-6 rounded-full" i={i} />
						)}
					</TokenCardFallback>
				</li>
			))}
		</>
	)
}

function Home({ token }: { token: TokenCard }) {
	return (
		<TokenCard
			token={token}
			action={<Blink mint={token.id} />}
			link={
				<Link
					href={{
						pathname: `/${token.creatorId}`,
					}}
					as={`/${token.creatorId}`}
					className="size-4"
				>
					<Icon className="size-4 text-cyan-400" name="creator" />
				</Link>
			}
		/>
	)
}

function Earn({ token }: { token: TokenCard }) {
	return <TokenCard token={token} action={<HarvestYieldForm token={token} />} />
}

const Profile = TokenCard

export { Home, Earn, Profile, Fallback }
