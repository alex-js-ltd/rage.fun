import { Suspense } from 'react'
import { SearchField, SearchResults } from '@/app/comps/search'
import { searchTokens } from '@/app/data/search_tokens'
import { type SearchParams } from '@/app/utils/schemas'
import { getTrendingTokens } from '@/app/data/get_trending_tokens'
import { Trending, TrendingFallBack } from '@/app/comps/trending'

type Props = {
	searchParams: Promise<SearchParams>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', search = '' } = searchParams

	const searchPromise = searchTokens(search)

	const trendingPromise = getTrendingTokens()

	return (
		<div className="relative w-full">
			<div className="sticky top-0 z-40 flex flex-col">
				<div className="mt-[6px]">
					<SearchField />
				</div>

				<Suspense>
					<SearchResults searchPromise={searchPromise} />
				</Suspense>

				<div className="h-[2px] bg-white/[0.125] my-4" />

				<Suspense fallback={<TrendingFallBack />}>
					<Trending trendingPromise={trendingPromise} />
				</Suspense>
			</div>
		</div>
	)
}
