'use client'

import { useRouter } from 'next/navigation'
import { Icon } from './_icon'
import { ReactNode } from 'react'

export function Header({ children }: { children?: ReactNode }) {
	return (
		<div className="sticky top-0 h-[52px] flex items-center z-50 w-full backdrop-blur px-4">
			<Back />
			{children}
		</div>
	)
}

export function Back() {
	const router = useRouter()

	return (
		<button
			onClick={() => {
				if (window.history.length > 1) {
					router.back()
				} else {
					router.push('/home') // fallback page
				}
			}}
			className="group flex items-center justify-center  hover:cursor-pointer size-[32px] -ml-2 rounded-full hover:bg-white/10 overflow-hidden"
		>
			<Icon name="back" className="size-5 text-text-200" />
		</button>
	)
}
