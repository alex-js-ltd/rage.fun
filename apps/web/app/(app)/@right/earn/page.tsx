import { Suspense } from 'react'
import { SearchField, SearchResults } from '@/app/comps/search_panel'
import { getSearchResults } from '@/app/data/get_search_results'
import { type SearchParams } from '@/app/utils/schemas'
import { getTrending } from '@/app/data/get_trending'
import { Trending, TrendingFallBack } from '@/app/comps/trending'
import { LinkDiscord } from '@/app/comps/link_discord'
import { auth } from '@/app/auth'
import { getDiscordId } from '@/app/data/get_discord_id'

type Props = {
	searchParams: Promise<SearchParams>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const session = await auth()

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', search = '' } = searchParams

	const searchPromise = getSearchResults(search)

	const trendingPromise = getTrending()

	const discordId = await getDiscordId(session?.user?.id)

	return (
		<div className="relative w-full">
			<div className="sticky top-0 z-40">
				<div className="mt-1.5">
					<SearchField />
				</div>

				<div className="flex flex-col gap-4 w-full">
					<Suspense>
						<SearchResults searchPromise={searchPromise} />
					</Suspense>

					<div className="h-0.5 bg-white/12.5 py-0" />

					<Suspense fallback={<TrendingFallBack />}>
						<Trending trendingPromise={trendingPromise} />
					</Suspense>

					{discordId || !session ? null : (
						<Suspense fallback={null}>
							<LinkDiscord discordId={discordId} />
						</Suspense>
					)}
				</div>
			</div>
		</div>
	)
}
