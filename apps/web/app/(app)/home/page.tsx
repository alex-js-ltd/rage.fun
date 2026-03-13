import { Suspense } from 'react'
import { SearchParams } from '@/app/utils/types'
import { getTokenFeed } from '@/app/data/get_token_feed'

type Props = {
	searchParams: Promise<SearchParams>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', search = '' } = searchParams

	const tokenFeedPromise = getTokenFeed({ sortOrder, sortType })

	console.log(await tokenFeedPromise)

	return <div className="w-full max-w-[600px] border-white border-x border-opacity-[0.125] bg-background-100"></div>
}
