'use client'

import React, {
	type RefObject,
	type ReactNode,
	createContext,
	useMemo,
	use,
	useCallback,
	useRef,
	useState,
	useReducer,
} from 'react'

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

function useCreatedAtFeed() {
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
					return prev
				}
			}
			return prev
		})
	})
}
