import { Suspense } from 'react'
import { type SearchParams } from '@/app/utils/schemas'
import { getTokenFeed } from '@/app/data/get_token_feed'
import { TokenFeed, TokenFeedFallback } from '@/app/comps/token_feed'
import { ExploreNav } from '@/app/comps/explore_nav'
import { Events } from '@/app/comps/events'

export const dynamic = 'force-dynamic'

type Props = {
	searchParams: Promise<SearchParams>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', search = '' } = searchParams

	const tokenPromise = getTokenFeed({ sortOrder, sortType, cursorId })

	return (
		<div className="w-full max-w-[600px] border-white border-x border-opacity-[0.125] bg-background-100">
			<Events />

			<div className="sticky top-0 h-[52px] flex items-center z-50 w-full bg-background-100/75 backdrop-blur-md  border-b border-white border-opacity-[0.125]  ">
				<ExploreNav searchParams={{ sortType }} />
			</div>

			<div className="relative mx-auto flex max-w-[600px] flex-col pb-0">
				<section className="p-0 ">
					<Suspense
						key={[sortType, sortOrder].toString()}
						fallback={
							<ul className="mx-auto grid w-full grid-cols-1 gap-0">
								<TokenFeedFallback />
							</ul>
						}
					>
						<TokenFeed tokenPromise={tokenPromise} />
					</Suspense>
				</section>
			</div>
		</div>
	)
}
