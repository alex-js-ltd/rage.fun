'use client'

import React, { use, useState, useEffect, useRef, ReactNode } from 'react'
import { SearchParams } from '@/app/utils/schemas'
import { useAsync } from '@/app/hooks/use_async'
import * as Ably from 'ably'
import { useChannel } from 'ably/react'
import dayjs from 'dayjs'
import { Loading } from './loading'
import { parseWithZod } from '@conform-to/zod'
import { SearchSchema } from '@/app/utils/schemas'
import { client } from '@/app/utils/client'
import { useInView } from 'react-intersection-observer'
import { type TokenCard } from '@/app/data/get_token_feed'
import { TokenCardFallback } from '@/app/comps/token_card'

export type InitialState = {
	tokens: Array<TokenCard>
	isLastPage: boolean
	searchParams: SearchParams
	nextCursorId?: string
}

export function TokenFeed({
	tokenPromise,
	creatorId,
	Component,
	fallback,
}: {
	tokenPromise: Promise<InitialState>
	creatorId?: string | undefined
	Component: React.ComponentType<{ token: TokenCard }>
	fallback: ReactNode
}) {
	const initialState = use(tokenPromise)

	const [state, setState] = useState<InitialState>(initialState)

	const { tokens, isLastPage, nextCursorId, searchParams } = state || {}

	const { channel } = useChannel('updateEvent', (message: Ably.Message) => {
		const e: TokenCard = message.data

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
							<Component token={token} />
						</li>
					)
				})}

				{/* Show loader card while fetching */}
				{isLoading ? fallback : null}
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
	const { data } = await client<{ data: InitialState }>(`/api/load_more?${params.toString()}`, {})

	return data
}

export function TokenFeedFallback({ count = 12, isEarnPage }: { count?: number; isEarnPage?: boolean }) {
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
