'use client'

import React, { type ReactNode, createContext, use } from 'react'
import invariant from 'tiny-invariant'
import { type InitialState } from '@/app/comps/token_grid'
import { TokenWithRelationsType } from '@/app/utils/schemas'

type Context = {
	searchPromise: Promise<TokenWithRelationsType[]>
	tokenPromise: Promise<InitialState>
}

const ExploreContext = createContext<Context | undefined>(undefined)
ExploreContext.displayName = 'ExploreContext'

export function ExploreProvider({
	children,
	searchPromise,
	tokenPromise,
}: {
	children: ReactNode
	searchPromise: Promise<TokenWithRelationsType[]>
	tokenPromise: Promise<InitialState>
}) {
	return <ExploreContext.Provider value={{ searchPromise, tokenPromise }}>{children}</ExploreContext.Provider>
}

export function useExplore(): Context {
	let context = use(ExploreContext)

	invariant(context, 'useExplore must be used within an ExploreProvider')
	return context
}
