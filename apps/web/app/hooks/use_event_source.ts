import { useEffect, useRef } from 'react'
import { useLatestRef } from './use_latest_ref'

export function useEventSource(
	href: string,
	onMessage: (this: EventSource, event: EventSourceEventMap['message']) => void,
) {
	const latestOnMessageRef = useLatestRef(onMessage)

	useEffect(() => {
		const source = new EventSource(href)
		source.addEventListener('message', latestOnMessageRef.current)
		return () => source.close()
	}, [href, latestOnMessageRef])
}
