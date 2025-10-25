'use client'

import { signIn } from 'next-auth/react'

export function LinkDiscord() {
	async function handleClick() {
		await signIn('discord', {
			callbackUrl: '/home',
		})
	}

	return (
		<>
			<button
				onClick={handleClick}
				type="submit"
				className="rounded-md bg-[#5865F2] px-3 py-2 text-sm font-medium text-white hover:brightness-110 active:scale-95"
			>
				Link Discord
			</button>
		</>
	)
}
