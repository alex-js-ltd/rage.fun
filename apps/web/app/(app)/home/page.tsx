import { Suspense } from 'react'
import { SearchParamsSchema } from '@/app/utils/schemas'
import type { SearchParams } from '@/app/utils/schemas'
import { getTokenFeed } from '@/app/data/get_token_feed'
import { notFound } from 'next/navigation'
import { TokenFeed, TokenFeedFallback } from '@/app/comps/token_feed'
import * as TokenCard from '@/app/comps/token_card'
import { TokenNav } from '@/app/comps/token_nav'

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

	return (
		<div className="w-full max-w-150 border-white/5 border-x bg-background-100">
			{/* <Events /> */}

			<div className="sticky top-0 h-13 flex items-center z-50 w-full bg-background-100/75 backdrop-blur-md  border-b border-white/5">
				<TokenNav searchParams={{ sortType }} />
			</div>

			<div className="relative mx-auto flex max-w-150 flex-col pb-0">
				<section className="p-0 ">
					<Suspense
						key={`${sortType}:${sortOrder}`}
						fallback={
							<ul className="mx-auto grid w-full grid-cols-1 gap-0">
								<TokenFeedFallback />
							</ul>
						}
					>
						<TokenFeed
							key={`${sortType}:${sortOrder}`}
							tokenPromise={tokenFeedPromise}
							Component={TokenCard.Home}
							fallback={<TokenFeedFallback />}
						/>
					</Suspense>
				</section>
			</div>
		</div>
	)
}
