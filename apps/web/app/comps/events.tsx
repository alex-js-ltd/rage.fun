'use client'

import { useRef } from 'react'
import * as Ably from 'ably'
import { useChannel } from 'ably/react'
import { TokenLogo, getTokenLogoProps } from './token_logo'
import { Icon } from './_icon'
import { Collapsible, CollapsibleContent } from './collapsible'
import { useAsync } from '@/app/hooks/use_async'

import { type TokenFeedType } from '@/app/utils/schemas'

import { Button } from '@/app/comps/button'

export function Events() {
	const { run, data: current, reset, setData } = useAsync<TokenFeedType>()

	const timerRef = useRef<NodeJS.Timeout | null>(null) // Best practice

	// Listen for new events and add them to the queue
	useChannel('updateEvent', async (message: Ably.Message) => {
		const updateEvent: TokenFeedType = message.data

		setData(updateEvent)

		// Clear any existing timer
		if (timerRef.current) {
			clearTimeout(timerRef.current)
		}

		timerRef.current = setTimeout(() => {
			reset()

			timerRef.current = null // Clean up reference
		}, 10000)
	})

	const open = current ? true : false

	if (!current || current.updateType === 'CREATE') return null

	return (
		<Collapsible
			open={open}
			className="fixed top-[76px] left-1/2 -translate-x-1/2  z-50 flex items-center justify-center max-w-md w-full data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
		>
			<CollapsibleContent
				forceMount
				className="transition-transform duration-300 data-[state=closed]:animate-scale-out-50 data-[state=open]:animate-scale-in-50"
			>
				<div className="text-text-100 relative w-fit">
					<Button type="submit" className="w-fit h-auto relative flex items-center justify-center">
						<Icon name="up-arrow" className="size-4 text-text-100" />
					</Button>
					<input type="hidden" name="pathname" defaultValue={`/token/${current.id}?interval=86400000`} />
				</div>

				<TokenLogo className="rounded-full" {...getTokenLogoProps(current.metadata)} />

				<span>{current?.updateType === 'BUY' ? '🪄' : '🔥'}</span>
			</CollapsibleContent>
		</Collapsible>
	)
}
