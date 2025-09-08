import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function useScrollToTop() {
	const p = usePathname()

	useEffect(() => {
		// scroll page to top on every route change
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
	}, [p])

	return null
}
