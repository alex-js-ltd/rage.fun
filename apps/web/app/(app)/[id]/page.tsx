import { Suspense } from 'react'

// Explore
import { type SearchParams } from '@/app/utils/schemas'
import { getTokens } from '@/app/data/get_tokens'
import { TokenGrid, TokenGridFallback } from '@/app/comps/token_grid'

import { Back } from '@/app/comps/back'

export const dynamic = 'force-dynamic'

type Props = {
	searchParams: Promise<SearchParams>
	params: Promise<{ id: string }>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const { id: creatorId } = await props.params

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', query = '' } = searchParams

	const tokenPromise = getTokens({ sortType, sortOrder, cursorId, creatorId })

	return (
		<div className="flex-1">
			<div
				className="sticky top-0 h-[52px] border-x border-white border-opacity-[0.125] flex items-center z-40 w-full
                  bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60
                  border-b border-white/10 max-w-[600px] frost "
			>
				<Back />
			</div>

			<div className="relative mx-auto flex max-w-[600px] flex-col pb-0 border-x border-white border-opacity-[0.125] min-h-[calc(100vh-52px)]">
				<section className="p-0 ">
					<Suspense
						fallback={
							<ul className="mx-auto grid w-full grid-cols-1 gap-0">
								<TokenGridFallback creatorId={creatorId} />
							</ul>
						}
					>
						<TokenGrid tokenPromise={tokenPromise} creatorId={creatorId} />
					</Suspense>
				</section>
			</div>
		</div>
	)
}
