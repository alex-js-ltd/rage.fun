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

type Action = { type: 'CREATED_AT' } | { type: 'LAST_TRADE' } | { type: 'MARKET_CAP' }

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
		return state
	}, initialTokenFeed)

	const value = { state }

	return <TokenFeedContext.Provider value={value}>{children}</TokenFeedContext.Provider>
}

function useTokenFeed() {
	const context = use(TokenFeedContext)
	if (context === undefined) {
		throw new Error('useTokenFeed must be used within a TokenFeedProvider')
	}
	return context
}
