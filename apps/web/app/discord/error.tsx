'use client' // Error boundaries must be Client Components

import { getErrorMessage } from '@/app/utils/misc'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<div className="bg-background-200 w-full min-h-[100vh] grid place-items-center">
			<h2>{getErrorMessage(error)}</h2>
			<button onClick={() => reset()}>Try again</button>
		</div>
	)
}
