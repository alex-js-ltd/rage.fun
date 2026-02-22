'use client'

import { signIn, useSession } from 'next-auth/react'
import { useAsync } from '@/app/hooks/use_async'
import { type ButtonProps, Button } from './button'
import { storeSession } from '@/app/actions/store_session'

export function LinkDiscord({ onClick, children, discordId, ...rest }: ButtonProps & { discordId: string | null }) {
	const session = useSession()

	console.log('session', session)
	const { run } = useAsync()

	async function handleLink() {
		const userId = await storeSession()
		await signIn('discord', {
			callbackUrl: `/api/link_discord?userId=${userId}`,
		})
	}

	if (discordId) {
		return (
			<a href="https://discord.gg/FfmuN25GjE" target="_blank" rel="noopener noreferrer">
				{children}
			</a>
		)
	}

	return (
		<Button
			onClick={() => {
				const promise = handleLink()

				run(promise)
			}}
			{...rest}
		>
			{children}
		</Button>
	)
}
