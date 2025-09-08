'use client'

import { useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'

export function Redirect({ url }: { url: string }) {
	const { push } = useRouter()

	useLayoutEffect(() => {
		push(url)
	}, [push])

	return null
}
