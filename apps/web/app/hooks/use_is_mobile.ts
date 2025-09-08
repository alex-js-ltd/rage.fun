import { useEffect, useState } from 'react'

const MOBILE_USER_AGENTS = [
	/Android/i,
	/iPhone/i,
	/iPad/i,
	/iPod/i,
	/Windows Phone/i,
	/BlackBerry/i,
	/Opera Mini/i,
	/Mobile/i,
]

export function useIsMobile(): boolean {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const userAgent = navigator.userAgent
		const isMobileDevice = MOBILE_USER_AGENTS.some(pattern => pattern.test(userAgent))
		setIsMobile(isMobileDevice)
	}, [])

	return isMobile
}
