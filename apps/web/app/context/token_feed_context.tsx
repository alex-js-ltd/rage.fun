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
	data: TokenFeed
}

type Action =
	| { type: 'CREATE'; token: TokenCard }
	| { type: 'SWAP'; token: TokenCard }
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

	const [state, dispatch] = useReducer((state: TokenFeed, action: Action) => {
		switch (action.type) {
			case 'CREATE': {
				const next = [action.token, ...state.tokens]
				const nextCursorId = next?.length ? next[next.length - 1]?.id : undefined
				return { ...state, tokens: next, nextCursorId }
			}
		}
		return state
	}, initialTokenFeed)

	return <TokenFeedContext.Provider value={{ data: initialTokenFeed }}>{children}</TokenFeedContext.Provider>
}

function useTokenFeed() {
	const context = use(TokenFeedContext)
	if (context === undefined) {
		throw new Error('useTokenFeed must be used within a TokenFeedProvider')
	}
	return context
}
