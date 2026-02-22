'use client'

import { use, useState } from 'react'
import * as Ably from 'ably'
import { useChannel } from 'ably/react'
import { type Comment } from '@/app/data/get_comments'
import { shortAddress, timeAgo } from '@/app/utils/misc'

export function Comments({ mint, commentsPromise }: { mint: string; commentsPromise: Promise<Comment[]> }) {
	const comments = use(commentsPromise)
	const [state, setState] = useState<Comment[]>(comments)

	useChannel('commentEvent', (message: Ably.Message) => {
		const updateEvent: Comment = message.data
		// Only accept events for this token
		if (!mint || updateEvent.tokenId !== mint) return

		// Update using functional form; avoid duplicates
		setState(prev => {
			if (prev.some(c => c.id === updateEvent.id)) return prev
			return [updateEvent, ...prev]
		})
	})

	if (state.length === 0) return null

	return (
		<ul>
			{state.map(c => (
				<li key={c.id}>
					<article className="group relative flex flex-col w-full min-h-[100px] overflow-hidden border-b border-white border-opacity-[0.125] hover:bg-white/5 p-4">
						<div className="flex gap-2">
							<div className="flex flex-col gap-2">
								<div className="flex gap-2 items-center">
									<span className="text-text-200 text-sm">{shortAddress(c.ownerId)}</span>

									<span className="text-text-200 text-sm">{' • '}</span>
									<span className="text-text-500 text-xs">{timeAgo(new Date(c.createdAt))}</span>
								</div>
								<p className="text-text-200 text-sm">{c.content}</p>
							</div>
						</div>
					</article>
				</li>
			))}
		</ul>
	)
}
