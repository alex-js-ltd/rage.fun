import { Suspense } from 'react'

// Explore
import { type SearchParams } from '@/app/utils/schemas'
import { getTokenFeed } from '@/app/data/get_token_feed'
import { TokenFeed, TokenFeedFallback } from '@/app/comps/token_feed'

import { Header } from '@/app/comps/header'
import { getUser } from '@/app/data/get_user'
import Image from 'next/image'
import { shortAddress } from '@/app/utils/misc'
import * as TokenCard from '@/app/comps/token_card'

type Props = {
	searchParams: Promise<SearchParams>
	params: Promise<{ id: string }>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const { id: creatorId } = await props.params

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', search = '' } = searchParams

	const tokenPromise = getTokenFeed({ sortType, sortOrder, cursorId, creatorId })

	const user = await getUser(creatorId)

	return (
		<div className="flex-1 border-x border-white border-opacity-[0.125]">
			<Header>
				<div className="ml-2 flex items-center gap-2">
					{user?.image && (
						<div className="size-[20px] rounded-full overflow-hidden">
							<Image src={user?.image} alt={user?.id} width={20} height={20} />
						</div>
					)}

					{user?.name && <span className="text-text-200 font-mono text-[15px]">{user?.name}</span>}

					{user?.image && user?.name && <span className="text-text-200 font-mono text-[15px]">•</span>}

					<span className="text-text-200 font-mono text-xs">{shortAddress(creatorId)}</span>
				</div>
			</Header>

			<div className="relative mx-auto flex max-w-[600px] flex-col pb-0 border-t border-white border-opacity-[0.125] min-h-[calc(100vh-52px)]">
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
							tokenPromise={tokenPromise}
							creatorId={creatorId}
							Component={TokenCard.Profile}
							fallback={<TokenFeedFallback />}
						/>
					</Suspense>
				</section>
			</div>
		</div>
	)
}
