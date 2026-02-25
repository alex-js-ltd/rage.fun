import { Suspense } from 'react'

// Explore
import { type SearchParams } from '@/app/utils/schemas'
import { getTokenFeed } from '@/app/data/get_token_feed'
import { TokenFeed, TokenFeedFallback } from '@/app/comps/token_feed'

import { getIsCreator } from '@/app/data/get_is_creator'
import { auth } from '@/app/auth'

import { Header } from '@/app/comps/header'

import * as TokenCard from '@/app/comps/token_card'

type Props = {
	searchParams: Promise<SearchParams>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const session = await auth()

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', search = '' } = searchParams

	const creatorId = session?.user?.id

	const isCreator = await getIsCreator(creatorId)

	const tokenPromise = getTokenFeed({ sortType, sortOrder, cursorId, creatorId })

	return (
		<div className="flex-1 border-white border-x border-opacity-[0.125]">
			<Header />

			<div className="relative mx-auto flex max-w-[600px] flex-col pb-0 border-t border-white border-opacity-[0.125] min-h-[calc(100vh-52px)]">
				<section className="p-0 ">
					{isCreator ? (
						<Suspense
							fallback={
								<ul className="mx-auto grid w-full grid-cols-1 gap-0">
									<TokenFeedFallback isEarnPage={true} />
								</ul>
							}
						>
							<TokenFeed tokenPromise={tokenPromise} creatorId={creatorId} Component={TokenCard.Earn} />
						</Suspense>
					) : (
						<div className="p-4 flex flex-col gap-4">
							<p className="text-sm text-text-200">
								Launch a token on a <strong>decentralized bonding curve. </strong>
								Earn 1% from every trade, instantly — no middlemen, no extraction.
							</p>
						</div>
					)}
				</section>
			</div>
		</div>
	)
}
