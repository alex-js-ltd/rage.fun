'use client'

import { signIn, useSession } from 'next-auth/react'
import { useAsync } from '@/app/hooks/use_async'
import { type ButtonProps, Button } from './button'

export function LinkDiscord({ onClick, children, ...rest }: ButtonProps) {
	const session = useSession()

	console.log('session', session)
	const { run } = useAsync()

	return (
		<Button
			onClick={() => {
				const promise = signIn('discord', {
					callbackUrl: '/home',
				})

				run(promise)
			}}
			{...rest}
		>
			{children}
		</Button>
	)
}
