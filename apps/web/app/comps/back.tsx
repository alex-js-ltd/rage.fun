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
					router.push('/home') // fallback page
				}
			}}
			className="group flex items-center justify-center  hover:cursor-pointer size-[34px] -ml-2 rounded-full border border-red-500"
		>
			<Icon name="back" className="size-5 text-text-200" />
		</button>
	)
}
