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

type TokenFeed = {
	tokens: Array<TokenCard>
	isLastPage: boolean
	searchParams: SearchParams
	nextCursorId?: string
}

type Context = {
	state: TokenFeed
}

type Action =
	| { type: 'CREATE'; token: TokenCard }
	| { type: 'BUY'; token: TokenCard }
	| { type: 'SELL'; token: TokenCard }
	| { type: 'HARVEST'; token: TokenCard }

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
	const initialTokenFeed = use(tokenFeedPromise)

	const [state, dispatch] = useReducer((prev: TokenFeed, action: Action) => {
		switch (action.type) {
			case 'CREATE': {
				const next = [action.token, ...prev.tokens]
				const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined

				return { ...prev, tokens: next, nextCursorId }
			}

			case 'BUY':
			case 'SELL':
			case 'HARVEST': {
				const idx = prev.tokens.findIndex(t => t.id === action.token.id)
				if (idx === -1) {
					return prev
				}

				const next = prev.tokens.slice()
				next[idx] = { ...action.token }

				const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined

				return { ...prev, tokens: next, nextCursorId }
			}
		}
		return prev
	}, initialTokenFeed)

	const value = { state }

	return <TokenFeedContext.Provider value={value}> {children}</TokenFeedContext.Provider>
}

function useTokenFeed() {
	const context = use(TokenFeedContext)
	if (context === undefined) {
		throw new Error('useTokenFeed must be used within a TokenFeedProvider')
	}
	return context
}
