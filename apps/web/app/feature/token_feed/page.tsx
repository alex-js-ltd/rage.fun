import { Suspense } from 'react'
import { SearchParamsSchema } from '@/app/feature/token_feed/schema'
import type { SearchParams } from '@/app/feature/token_feed/schema'
import { getTokenFeed } from '@/app/feature/token_feed/query'
import { notFound } from 'next/navigation'

type Props = {
	searchParams: Promise<SearchParams>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const submission = SearchParamsSchema.safeParse(searchParams)

	if (submission.error) {
		console.error(submission)
		notFound()
	}

	const { sortType, sortOrder } = submission.data

	const tokenFeedPromise = getTokenFeed({ sortOrder, sortType })

	console.log(await tokenFeedPromise)

	return <div className="w-full max-w-[600px] border-white border-x border-opacity-[0.125] bg-background-100"></div>
}
