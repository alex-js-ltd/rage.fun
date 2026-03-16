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
	if (typeof navigator === 'undefined') return false

	const userAgent = navigator.userAgent
	return MOBILE_USER_AGENTS.some(pattern => pattern.test(userAgent))
}
