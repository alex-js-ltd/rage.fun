'use client'

import React, { use, useState, useEffect, useRef, FormHTMLAttributes } from 'react'
import Link from 'next/link'

import { Icon } from './_icon'
import { type TokenFeedType, SearchParams } from '@/app/utils/schemas'

import { useAsync } from '@/app/hooks/use_async'
import Image from 'next/image'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'

import { cn, formatNumberSmart } from '@/app/utils/misc'
import dayjs from 'dayjs'
import { Loading } from './loading'

import { createPngDataUri } from 'unlazy/thumbhash'
import { parseWithZod } from '@conform-to/zod'
import { SearchSchema } from '@/app/utils/schemas'
import { client } from '@/app/utils/client'

import { SquareProgress } from './square_progress'
import { shortAddress } from '@/app/utils/misc'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/comps/tooltip'

import { useInView } from 'react-intersection-observer'
import { HarvestYieldForm } from '@/app/comps/harvest_yield_form'
import { usePathname } from 'next/navigation'
import { Blink } from './blink'

export type InitialState = {
	tokens: TokenFeedType[]
	isLastPage: boolean
	searchParams: SearchParams
	nextCursorId?: string
}

function TokenCard({
	token,
	pathname,
	children,
}: {
	token: TokenFeedType
	pathname: string
	children?: React.ReactNode
}) {
	const {
		id: mint,
		creatorId,
		metadata: { name, symbol, image, thumbhash },
		bondingCurve: { updatedAt },
		marketData: { progress, price, marketCap, liquidity, volume, buyCount, sellCount },
		updateType,
	} = token

	const disableCreatorLink = pathname !== '/home'

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

	return (
		<article className="group relative flex flex-col w-full h-full min-h-[178px] border-b border-white border-opacity-[0.125] hover:bg-white/10 bg-background-100">
			<div
				onAnimationEnd={() => setAnimate(false)}
				className={cn(
					'absolute inset-0',
					updateType === 'Buy' &&
						animate &&
						[
							'absolute',
							'inset-0',
							'z-20',
							'pointer-events-none',
							'overflow-hidden',
							'bg-transparent',
							'before:pointer-events-none',
							'before:absolute',
							'before:inset-0',
							'before:bg-gradient-to-r',
							'before:from-transparent',
							'before:via-teal-300/10',
							'before:to-transparent',
							'before:animate-wave-once',
						].join(' '),
					updateType === 'Sell' &&
						animate &&
						[
							'absolute',
							'inset-0',
							'z-20',
							'pointer-events-none',
							'overflow-hidden',
							'bg-transparent',
							'before:pointer-events-none',
							'before:absolute',
							'before:inset-0',
							'before:bg-gradient-to-r',
							'before:from-transparent',
							'before:via-red-300/10',
							'before:to-transparent',
							'before:animate-wave-once',
						].join(' '),
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
									src={`${image}`}
									alt={`${name}`}
									className="object-cover object-center w-full h-full z-0"
									fill={true}
									blurDataURL={createPngDataUri(thumbhash)}
									placeholder="blur"
									sizes="(min-width: 1280px) 14vw, (min-width: 1024px) 16vw, (min-width: 768px) 20vw, (min-width: 640px) 25vw, 33vw"
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

						{disableCreatorLink ? null : (
							<Link
								href={{
									pathname: `/${creatorId}`,
								}}
								as={`/${creatorId}`}
								className="size-4"
							>
								<Icon className="size-4 text-cyan-400" name="creator" />
							</Link>
						)}
					</div>
				</div>

				<div className="flex gap-2 items-center flex-wrap h-[32px]">
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

					<div className="xs:ml-auto">{children ? children : null}</div>
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

export function TokenGrid({
	tokenPromise,
	creatorId,
}: {
	tokenPromise: Promise<InitialState>
	creatorId?: string | undefined
}) {
	const pathname = usePathname()

	const initialState = use(tokenPromise)

	const [state, setState] = useState<InitialState>(initialState)

	console.log(state)

	const { tokens, isLastPage, nextCursorId, searchParams } = state || {}

	const { channel } = useChannel('updateEvent', (message: Ably.Message) => {
		const e: TokenFeedType = message.data

		if (!state || !e.updateType) return

		setState(prev => {
			if (!prev) return prev
			const sortType = prev.searchParams?.sortType ?? 'createdAt'

			switch (sortType) {
				case 'createdAt': {
					if (e.updateType === 'Create') {
						const filtered = prev.tokens.filter(t => t.id !== e.id)

						const next = [e, ...filtered]
						const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined

						return { ...prev, tokens: next, nextCursorId }
					}

					if (e.updateType === 'Buy' || e.updateType === 'Sell' || e.updateType === 'Harvest') {
						const idx = prev.tokens.findIndex(t => t.id === e.id)
						if (idx === -1) return prev

						const next = prev.tokens.slice()
						next[idx] = { ...e }

						const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined

						return { ...prev, tokens: next, nextCursorId }
					}
				}
				case 'lastTrade': {
					if (e.updateType !== 'Buy' && e.updateType !== 'Sell') return prev

					const first = prev.tokens[0]

					if (first.id === e.id) return prev

					const next = [e, ...prev.tokens.filter(t => t.id !== e.id)]

					next.sort(
						(a, b) =>
							dayjs.unix(Number(b?.bondingCurve?.updatedAt)).valueOf() -
							dayjs.unix(Number(a?.bondingCurve?.updatedAt)).valueOf(),
					)

					const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined

					return { ...prev, tokens: next, nextCursorId }
				}
				case 'marketCap': {
					if (e.updateType !== 'Buy' && e.updateType !== 'Sell') return prev

					const idx = prev.tokens.findIndex(t => t.id === e.id)
					if (idx === -1) return prev
					const next = prev.tokens.slice()
					next[idx] = { ...e }
					next.sort((a, b) => b?.marketData?.marketCap - a?.marketData?.marketCap)

					const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined

					return { ...prev, tokens: next, nextCursorId }
				}
				default:
					const idx = prev.tokens.findIndex(t => t.id === e.id)
					if (idx === -1) return prev

					const next = prev.tokens.slice()
					next[idx] = { ...e }

					const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined

					return { ...prev, tokens: next, nextCursorId }
			}
		})
	})

	const { run, isLoading } = useAsync<InitialState>()

	const { ref, inView, entry } = useInView({
		/* Optional options */
		threshold: 0,

		rootMargin: '0px 0px 350px 0px',
	})

	const formRef = useRef<HTMLFormElement>(null)

	useEffect(() => {
		if (inView && !isLoading && !isLastPage) {
			formRef.current?.requestSubmit()
		}
	}, [inView, isLoading, isLastPage])

	const isEarnPage = pathname === '/earn' && !!creatorId

	return (
		<div className="grid">
			<ul className="mx-auto grid w-full grid-cols-1 gap-0">
				{tokens.map((token, i) => {
					const isPenultimate = i === tokens.length - 2

					return (
						<li
							key={token.id}
							ref={isPenultimate && !isLastPage && !isLoading ? ref : undefined}
							className="space-y-4 w-full"
						>
							<TokenCard token={token} pathname={pathname}>
								{isEarnPage ? <HarvestYieldForm token={token} /> : <Blink mint={token.id} />}
							</TokenCard>
						</li>
					)
				})}

				{/* Show loader card while fetching */}
				{isLoading ? <TokenGridFallback isEarnPage={isEarnPage} /> : null}
			</ul>

			<form
				ref={formRef}
				onSubmit={e => {
					e.preventDefault()

					if (isLoading || isLastPage) return

					const formData = new FormData(e.currentTarget)

					const submission = parseWithZod(formData, {
						schema: SearchSchema,
					})

					if (submission.status !== 'success') {
						console.error(submission.error)
						return
					}

					const params = new URLSearchParams(submission.value)

					const promise = loadMore(params)

					run(promise).then(res => setState(prev => ({ ...res, tokens: [...(prev?.tokens || []), ...res.tokens] })))
				}}
				className="sr-only"
			>
				<input type="hidden" defaultValue={nextCursorId} name="cursorId" />
				<input type="hidden" defaultValue={searchParams?.sortType} name="sortType" />
				<input type="hidden" defaultValue={searchParams?.sortOrder} name="sortOrder" />
				{creatorId && <input type="hidden" defaultValue={creatorId} name="creatorId" />}
			</form>
		</div>
	)
}

async function loadMore(params: URLSearchParams): Promise<InitialState> {
	const { data } = await client<{ data: InitialState }>(`/api/load_more?${params.toString()}`, {
		method: 'GET',
		redirect: 'manual', // optional
	})

	return data
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

				<div className="flex gap-2 items-center flex-wrap h-[32px]">
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

					<div className="xs:ml-auto">{children ? children : null}</div>
				</div>
			</div>
		</article>
	)
}

export function TokenGridFallback({ count = 12, isEarnPage }: { count?: number; isEarnPage?: boolean }) {
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
