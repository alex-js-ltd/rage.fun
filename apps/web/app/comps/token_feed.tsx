'use client'

import React, { use, useState, useEffect, useRef, ReactNode } from 'react'
import { SearchParams } from '@/app/utils/schemas'
import { useAsync } from '@/app/hooks/use_async'
import * as Ably from 'ably'
import { useChannel } from 'ably/react'
import { Loading } from '@/app/comps/ui/loading'
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

function prepend(prev: InitialState, token: TokenCard) {
	const filtered = prev.tokens.filter(t => t.id !== token.id)

	const next = [token, ...filtered]
	const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined

	return { ...prev, tokens: next, nextCursorId }
}

function replace(prev: InitialState, token: TokenCard) {
	const idx = prev.tokens.findIndex(t => t.id === token.id)

	if (idx === -1) {
		return prev
	}

	const next = prev.tokens.slice()
	next[idx] = { ...token }

	const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined

	return { ...prev, tokens: next, nextCursorId }
}

function sortByMarketCap(prev: InitialState, token: TokenCard) {
	const idx = prev.tokens.findIndex(t => t.id === token.id)

	if (idx === -1) {
		return prev
	}

	const copy = prev.tokens.slice()
	copy[idx] = { ...token }

	const next = copy.toSorted((a, b) => b.marketData.marketCap - a.marketData.marketCap)

	const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined

	return { ...prev, tokens: next, nextCursorId }
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

	useChannel('updateEvent', (message: Ably.Message) => {
		const e: TokenCard = message.data

		setState(prev => {
			const { sortType } = prev.searchParams

			switch (e.updateType) {
				case 'Create': {
					if (sortType !== 'createdAt') {
						return prev
					}

					return prepend(prev, e)
				}

				case 'Buy':
				case 'Sell': {
					if (sortType === 'createdAt') {
						return replace(prev, e)
					}

					if (sortType === 'lastTrade') {
						return prepend(prev, e)
					}

					if (sortType === 'marketCap') {
						return sortByMarketCap(prev, e)
					}

					return prev
				}

				case 'Harvest': {
					return replace(prev, e)
				}

				default:
					return prev
			}
		})
	})

	const { run, isLoading } = useAsync<InitialState>()

	const { ref, inView } = useInView({
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
							className="w-full space-y-4"
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

					const params = new URLSearchParams(
						Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>,
					)

					const promise = loadMore(params)

					run(promise).then(res =>
						setState(prev => ({
							...res,
							tokens: [...(prev?.tokens || []), ...res.tokens],
						})),
					)
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
				<li key={`loading-card-${i}`} className="w-full space-y-4">
					<TokenCardFallback i={i}>
						{isEarnPage ? (
							<Loading className="h-[34px] w-[74px] rounded-full" i={i} />
						) : (
							<Loading className="h-6 w-[120px] rounded-full" i={i} />
						)}
					</TokenCardFallback>
				</li>
			))}
		</>
	)
}
