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
import { shortenWallet } from '@/app/utils/misc'
import { type TooltipContentProps, Tooltip, TooltipContent, TooltipTrigger } from '@/app/comps/tooltip'

import { useInView } from 'react-intersection-observer'
import { HarvestYieldForm } from '@/app/comps/harvest_yield_form'

export type InitialState = {
	tokens: TokenFeedType[]
	isLastPage: boolean
	searchParams: SearchParams
	nextCursorId?: string
}

function TokenCard({ token, children }: { token: TokenFeedType; children?: React.ReactNode }) {
	const {
		id: mint,
		creatorId,
		metadata: { name, symbol, image, thumbhash },

		metrics: { progress, price, marketCap, liquidity, volume, transactionCount },
		updateType,
	} = token

	return (
		<article className="group relative flex flex-col w-full min-h-[178px] border-b border-white border-opacity-[0.125] hover:bg-white/[0.05]">
			<div
				className={cn(
					'absolute inset-0',
					updateType === 'Buy' && 'animate-buy',
					updateType === 'Sell' && 'animate-sell',
				)}
			/>
			<div className="relative p-4 grid grid-cols-1 gap-4">
				<div className="flex gap-4">
					<SquareProgress progress={progress} size={74}>
						<Link
							className="w-[72px] h-[72px] cursor-pointer relative rounded-md overflow-hidden flex-shrink-0"
							aria-label={`View ${name}`}
							href={{
								pathname: `/token/${mint}`,
								query: { interval: '86400000' },
							}}
							as={`/token/${mint}?interval=86400000`}
							scroll={true}
							onClick={e => {
								e.stopPropagation()
							}}
							prefetch={true}
						>
							<Image
								priority
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

					<div className="grid grid-cols-1 gap-1 w-full">
						<div className="text text-text-200 w-full">{symbol}</div>

						<Tooltip>
							<TooltipTrigger asChild>
								<span className="text-xs text-text-200 w-fit">{shortenWallet(creatorId)}</span>
							</TooltipTrigger>
							<TooltipContent variant={'submit_3'} side="bottom" sideOffset={-20}>
								Creator
							</TooltipContent>
						</Tooltip>
					</div>
				</div>

				<div className="flex gap-2 items-center flex-wrap">
					<div className="flex gap-2 items-center flex-wrap">
						<Pill label="P" value={`$${formatNumberSmart(price)}`} tooltip="Price" />
						<Pill label="M" value={`$${formatNumberSmart(marketCap)}`} tooltip="Market Cap" />

						<Pill label="L" value={`$${formatNumberSmart(liquidity)}`} tooltip="Liquidity" />

						<Pill label="V" value={`$${formatNumberSmart(volume)}`} tooltip="Volume" />

						<Pill
							label={''}
							value={
								<div className="flex gap-2">
									<div className="text-emerald-400">{transactionCount.buys}</div> /{' '}
									<div className="text-red-400">{transactionCount.sells}</div>
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
		<div className={`flex border border-white border-opacity-[0.125] py-1 px-2 rounded-full w-fit ${className ?? ''}`}>
			<div className="flex gap-1">
				<span className="text-sm text-text-200">{label}</span>
				<span className="text-sm text-text-200">{value}</span>
			</div>
		</div>
	)

	if (!tooltip) return body

	return (
		<Tooltip>
			<TooltipTrigger asChild>{body}</TooltipTrigger>
			<TooltipContent variant={'submit_3'} side="bottom" sideOffset={6}>
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
	const initialState = use(tokenPromise)

	const [state, setState] = useState<InitialState>(initialState)

	const { tokens, isLastPage, nextCursorId, searchParams } = state || {}

	const { channel } = useChannel('updateEvent', (message: Ably.Message) => {
		const updateEvent: TokenFeedType = message.data

		if (!state || !updateEvent.updateType) return

		// Create Event
		if (
			updateEvent.updateType === 'Create' &&
			searchParams?.sortType === 'createdAt' &&
			searchParams?.sortOrder === 'desc'
		) {
			const newTokens = [updateEvent, ...state.tokens]

			setState({ ...state, tokens: newTokens })
			return
		}

		const existingIndex = state.tokens.findIndex(t => t.id === updateEvent.id)

		if (existingIndex !== -1) {
			const newTokens = [...state.tokens]
			newTokens[existingIndex] = updateEvent

			if (searchParams?.sortType === 'lastTrade') {
				newTokens.sort((a, b) => {
					const aTime = dayjs(a.bondingCurve.updatedAt).valueOf()
					const bTime = dayjs(b.bondingCurve.updatedAt).valueOf()

					return searchParams?.sortOrder === 'asc'
						? aTime - bTime // oldest → newest
						: bTime - aTime // newest → oldest
				})
			}

			setState({ ...state, tokens: newTokens })
		}
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
							<TokenCard token={token}>{creatorId ? <HarvestYieldForm token={token} /> : null}</TokenCard>
						</li>
					)
				})}

				{/* Show loader card while fetching */}
				{isLoading ? <TokenGridFallback creatorId={creatorId} /> : null}
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
		<article className="group relative flex flex-col w-full h-[178px] overflow-hidden border-b border-white border-opacity-[0.125]">
			<div className="relative cursor-pointer p-4 grid grid-cols-1 gap-4">
				<div className="flex gap-4">
					<SquareProgress progress={0} size={74}>
						<div className="w-[72px] h-[72px] relative rounded-md overflow-hidden flex-shrink-0">
							<Loading i={i} />
						</div>
					</SquareProgress>

					<div className="grid grid-cols-1 gap-1 w-full">
						<div className="text text-text-200 w-fit">
							<Loading className="text-sm w-[62px] h-[12px] rounded-full" i={i + 1} />
						</div>
						<div className="text-xs text-text-200 w-fit">
							<Loading className="text-xs w-[62px] h-[10px] rounded-full" i={i + 2} />
						</div>
					</div>
				</div>

				<div className="flex gap-2 items-center flex-wrap">
					<div className="flex gap-2 items-center flex-wrap">
						<Loading className="w-[62px] h-[20px] rounded-full" i={i + 3} />
						<Loading className="w-[62px] h-[20px] rounded-full" i={i + 4} />
						<Loading className="w-[62px] h-[20px] rounded-full" i={i + 5} />
						<Loading className="w-[62px] h-[20px] rounded-full" i={i + 6} />
						<Loading className="w-[62px] h-[20px] rounded-full" i={i + 7} />
					</div>

					<div className="xs:ml-auto">{children ? children : null}</div>
				</div>
			</div>
		</article>
	)
}

export function TokenGridFallback({ count = 12, creatorId }: { count?: number; creatorId?: string }) {
	return (
		<>
			{Array.from({ length: count }, (_, i) => (
				<li key={`loading-card-${i}`} className="space-y-4 w-full">
					<TokenCardFallback i={i}>
						{creatorId && <Loading className="w-[74px] h-[34px] rounded-full" i={i} />}
					</TokenCardFallback>
				</li>
			))}
		</>
	)
}
