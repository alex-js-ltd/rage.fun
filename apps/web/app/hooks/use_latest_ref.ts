import { useEffect, useRef } from 'react'

export function useLatestRef<ThingType>(thing: ThingType) {
	const latestRef = useRef(thing)
	useEffect(() => {
		latestRef.current = thing
	})
	return latestRef
}
