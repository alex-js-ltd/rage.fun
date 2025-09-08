'use client'

import { useRouter } from 'next/navigation'
import { Icon } from './_icon'

export function Back() {
	const router = useRouter()

	return (
		<button
			onClick={() => {
				if (window.history.length > 1) {
					router.back()
				} else {
					router.push('/') // fallback page
				}
			}}
			className="group flex items-center gap-1.5 text-sm text-gray-500 hover:cursor-pointer h-[52px] ml-2"
		>
			<Icon name="back" className="size-4 text-gray-500" />
			<span>Back</span>
		</button>
	)
}
