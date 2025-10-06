'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function Redirect({ url }: { url: string }) {
	const router = useRouter()

	useEffect(() => {
		router.push(url) // your target URL
	}, [router, url])

	return <div className="bg-rage-100 fixed inset-0 " />
}
