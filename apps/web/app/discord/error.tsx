// app/global-error.tsx
'use client'

import { useEffect, Fragment } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		// Log to console for debugging
		console.error('[GlobalError]', error)
	}, [error])

	return (
		<Fragment>
			<h2>Something went wrong.</h2>
			<p className="text-sm text-gray-500">{error.message}</p>
			<button className="mt-4 rounded border px-3 py-1" onClick={() => reset()}>
				Try again
			</button>
		</Fragment>
	)
}
