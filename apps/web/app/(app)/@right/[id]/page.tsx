import { Suspense } from 'react'
import { SearchField, SearchResults } from '@/app/comps/search_panel'
import { getSearchResults } from '@/app/data/get_search_results'
import { type SearchParams } from '@/app/utils/schemas'
import { getTrending } from '@/app/data/get_trending'
import { Trending, TrendingFallBack } from '@/app/comps/trending'

type Props = {
	searchParams: Promise<SearchParams>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', search = '' } = searchParams

	const searchPromise = getSearchResults(search)

	const trendingPromise = getTrending()

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
