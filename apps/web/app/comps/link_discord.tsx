'use client'

import { signIn, useSession } from 'next-auth/react'
import { useAsync } from '@/app/hooks/use_async'
import { type ButtonProps, Button } from './button'
import { storeSession } from '@/app/actions/store_session'

export function LinkDiscord({ onClick, children, ...rest }: ButtonProps) {
	const session = useSession()

	console.log('session', session)
	const { run } = useAsync()

	async function handleLink() {
		await storeSession()

		await signIn('discord', {
			callbackUrl: '/home',
		})
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
