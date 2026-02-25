'use client'

import React, { type ReactNode, createContext, use, useState } from 'react'

import { type TokenCard } from '@/app/data/get_token_feed'
import { SearchParams } from '@/app/utils/schemas'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'

type TokenFeed = {
	tokens: Array<TokenCard>
	isLastPage: boolean
	searchParams: SearchParams
	nextCursorId?: string
}

type Context = {
	initialState: TokenFeed
}

const TokenFeedContext = createContext<Context | undefined>(undefined)
TokenFeedContext.displayName = 'TokenFeedContext'

function TokenFeedProvider({
	children,
	tokenFeedPromise,
	creatorId,
}: {
	children: ReactNode
	tokenFeedPromise: Promise<TokenFeed>
	creatorId?: string | undefined
}) {
	const initialState = use(tokenFeedPromise)

	const value = { initialState }

	return <TokenFeedContext.Provider value={value}> {children}</TokenFeedContext.Provider>
}

function useTokenFeed() {
	const context = use(TokenFeedContext)
	if (context === undefined) {
		throw new Error('useTokenFeed must be used within a TokenFeedProvider')
	}
	return context
}

function useCreatedAt() {
	const { initialState } = useTokenFeed()

	const [state, setState] = useState(initialState)

	const { channel } = useChannel('updateEvent', (message: Ably.Message) => {
		const e: TokenCard = message.data

		const { updateType } = e

		setState(prev => {
			switch (updateType) {
				case 'Create': {
					const filtered = prev.tokens.filter(t => t.id !== e.id)

					const next = [e, ...filtered]
					const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined
					return { ...prev, tokens: next, nextCursorId }
				}
				case 'Buy':
				case 'Sell':
				case 'Harvest': {
					const idx = prev.tokens.findIndex(t => t.id === e.id)
					if (idx === -1) {
						return prev
					}

					const next = prev.tokens.slice()
					next[idx] = { ...e }

					const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined

					return { ...prev, tokens: next, nextCursorId }
				}
			}
			return prev
		})
	})

	return { state }
}

function useLastTrade() {
	const { initialState } = useTokenFeed()

	const [state, setState] = useState(initialState)

	const { channel } = useChannel('updateEvent', (message: Ably.Message) => {
		const e: TokenCard = message.data

		const { updateType } = e

		setState(prev => {
			switch (updateType) {
				case 'Buy':
				case 'Sell': {
					const filtered = prev.tokens.filter(t => t.id !== e.id)

					const next = [e, ...filtered]
					const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined
					return { ...prev, tokens: next, nextCursorId }
				}
			}
			return prev
		})
	})

	return { state }
}

function useMarketCap() {
	const { initialState } = useTokenFeed()

	const [state, setState] = useState(initialState)

	const { channel } = useChannel('updateEvent', (message: Ably.Message) => {
		const e: TokenCard = message.data

		const { updateType } = e

		setState(prev => {
			switch (updateType) {
				case 'Buy':
				case 'Sell': {
					const idx = prev.tokens.findIndex(t => t.id === e.id)
					if (idx === -1) {
						return prev
					}

					const next = prev.tokens.slice()
					next[idx] = { ...e }

					next.sort((a, b) => b?.marketData?.marketCap - a?.marketData?.marketCap)

					const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined

					return { ...prev, tokens: next, nextCursorId }
				}
			}
			return prev
		})
	})

	return { state }
}

function CreatedAt({ children }: { children: ReactNode }) {
	const { state } = useCreatedAt()

	return <div>{children}</div>
}

const Root = TokenFeedProvider

export { Root, CreatedAt }
