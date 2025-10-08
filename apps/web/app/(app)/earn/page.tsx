import { Suspense } from 'react'

// Explore
import { type SearchParams } from '@/app/utils/schemas'
import { getTokens } from '@/app/data/get_tokens'
import { TokenGrid, TokenGridFallback } from '@/app/comps/token_grid'

import { getIsCreator } from '@/app/data/get_is_creator'
import { auth } from '@/app/auth'

import { Back } from '@/app/comps/back'
import { Header } from '@/app/comps/header'

export const dynamic = 'force-dynamic'

type Props = {
	searchParams: Promise<SearchParams>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const session = await auth()

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', query = '' } = searchParams

	const creatorId = session?.user?.id

	const isCreator = await getIsCreator(creatorId)

	const tokenPromise = getTokens({ sortType, sortOrder, cursorId, creatorId })

	return (
		<div className="flex-1 border-white border-x border-opacity-[0.125]">
			<Header />

			<div className="relative mx-auto flex max-w-[600px] flex-col pb-0 border-t border-white border-opacity-[0.125] min-h-[calc(100vh-52px)]">
				<section className="p-0 ">
					{isCreator ? (
						<Suspense
							fallback={
								<ul className="mx-auto grid w-full grid-cols-1 gap-0">
									<TokenGridFallback isEarnPage={true} />
								</ul>
							}
						>
							<TokenGrid tokenPromise={tokenPromise} creatorId={creatorId} />
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
