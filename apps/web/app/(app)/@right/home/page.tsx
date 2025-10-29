import { Suspense } from 'react'
import { SearchField, SearchResults } from '@/app/comps/search'
import { searchTokens } from '@/app/data/search_tokens'
import { type SearchParams } from '@/app/utils/schemas'
import { getTrendingTokens } from '@/app/data/get_trending_tokens'
import { Trending, TrendingFallBack } from '@/app/comps/trending'
import { Welcome } from '@/app/comps/welcome'
import { auth } from '@/app/auth'
import { getDiscordId } from '@/app/data/get_discord_id'
import { TopCreators } from '@/app/comps/top_creators'
import { getTopCreators } from '@/app/data/get_top_creators'
export const dynamic = 'force-dynamic'

type Props = {
	searchParams: Promise<SearchParams>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const session = await auth()

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', search = '' } = searchParams

	const searchPromise = searchTokens(search)

	const trendingPromise = getTrendingTokens()

	const discordIdPromise = getDiscordId(session?.user?.id)

	const topCreatorsPromise = getTopCreators()

	return (
		<div className="relative w-full">
			<div className="sticky top-0 z-40">
				<div className="mt-[6px]">
					<SearchField />
				</div>

				<div className="flex flex-col gap-4">
					<Suspense>
						<SearchResults searchPromise={searchPromise} />
					</Suspense>

					<div className="h-[2px] bg-white/[0.125] py-0" />

					<Suspense fallback={<TrendingFallBack />}>
						<Trending trendingPromise={trendingPromise} />
					</Suspense>

					{!session ? null : (
						<Suspense fallback={null}>
							<Welcome discordIdPromise={discordIdPromise} />
						</Suspense>
					)}
				</div>
			</div>
		</div>
	)
}
