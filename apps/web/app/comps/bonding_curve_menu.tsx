'use client'

import { useState, use } from 'react'
import { type TokenWithRelationsType } from '@/app/utils/schemas'
import { TokenPair } from './token_pair'
import { Progress } from './progress'
import { cn } from '@/app/utils/misc'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'

import { Loading } from './loading'

interface BondingCurveMenuProps {
	tokenPromise: Promise<TokenWithRelationsType>
}

export function BondingCurveMenu({ tokenPromise }: BondingCurveMenuProps) {
	const token = use(tokenPromise)

	const [state, setState] = useState<TokenWithRelationsType>(token)

	const { id: mint } = state
	const { progress } = state.bondingCurve

	useChannel('updateEvent', (message: Ably.Message) => {
		const updateEvent: TokenWithRelationsType = message.data

		if (updateEvent.id === state.id) {
			setState(updateEvent)
		}
	})

	return (
		<div className={cn('relative grid h-full gap-4 overflow-hidden')}>
			<TokenPair className="justify-end self-start z-10" tokenPromise={tokenPromise} />

			<Progress progress={progress} mint={mint} className="z-10" />
		</div>
	)
}

export function BondingCurveMenuFallback() {
	return (
		<div className="relative grid h-full gap-4 overflow-hidden">
			<Loading
				i={8}
				className="relative justify-end self-start ml-auto w-[25%] h-[20px] overflow-hidden rounded-xl z-10"
			/>

			<div className="z-10 mt-auto rounded-full p-3 border border-white border-opacity-[0.125]">
				<Loading
					i={9}
					className="z-10 h-[32px] mt-auto rounded-full relative overflow-hidden bg-transparent w-full  border border-white border-opacity-[0.125]"
				/>
			</div>
		</div>
	)
}
