'use client'

import { signIn } from 'next-auth/react'
import { Icon } from './_icon'

export function LinkDiscord() {
	async function handleClick() {
		await signIn('discord', {
			callbackUrl: '/home',
		})
	}

	return (
		<div className="fixed bottom-16 sm:bottom-8 right-8">
			<button onClick={handleClick} type="submit" className="w-[55px] h-[55px] rounded-md">
				<Icon name="Discord-Logo" className="w-[55px] h-[55px] " />
			</button>
		</div>
	)
}
