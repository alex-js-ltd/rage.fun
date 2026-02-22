'use client'

import { useRef } from 'react'
import * as Ably from 'ably'
import { useChannel } from 'ably/react'
import { TokenLogo, getTokenLogoProps } from './token_logo'
import { Icon } from './_icon'
import { Collapsible, CollapsibleContent } from './collapsible'
import { useAsync } from '@/app/hooks/use_async'

import { Button } from '@/app/comps/button'
import Link from 'next/link'
import { type TokenCard } from '../data/get_tokens'

export function Events() {
	const { run, data: current, reset, setData } = useAsync<TokenCard>()

	const timerRef = useRef<NodeJS.Timeout | null>(null) // Best practice

	// Listen for new events and add them to the queue
	useChannel('updateEvent', async (message: Ably.Message) => {
		const updateEvent: TokenCard = message.data

		setData(updateEvent)

		// Clear any existing timer
		if (timerRef.current) {
			clearTimeout(timerRef.current)
		}

		timerRef.current = setTimeout(() => {
			reset()

			timerRef.current = null // Clean up reference
		}, 3000)
	})

	const open = current ? true : false

	if (!current || current.updateType === 'Create') return null

	return (
		<Collapsible
			open={open}
			className="absolute top-[76px] left-1/2 -translate-x-1/2  z-50 flex items-center justify-center max-w-md w-full data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
		>
			<CollapsibleContent
				forceMount
				className="transition-transform duration-300 data-[state=closed]:animate-scale-out-50 data-[state=open]:animate-scale-in-50"
			>
				<Link
					href={{
						pathname: `/token/${current.id}`,
						query: { interval: '5m' },
					}}
					as={`/token/${current.id}?interval=5m`}
					className="text-text-100 relative w-fit"
					prefetch={false}
				>
					<Button type="submit" className="w-fit h-auto relative flex items-center justify-center">
						<Icon name="up-arrow" className="size-4 text-text-100" />
					</Button>
					<input type="hidden" name="pathname" defaultValue={`/token/${current.id}?interval=86400000`} />
				</Link>

				<TokenLogo className="rounded-full" {...getTokenLogoProps(current.metadata)} />

				<span>{current?.updateType === 'Buy' ? '🤑' : '🔥'}</span>
			</CollapsibleContent>
		</Collapsible>
	)
}
