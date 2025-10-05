import { Suspense } from 'react'
import { type SearchParams } from '@/app/utils/schemas'
import { getTokens } from '@/app/data/get_tokens'
import { TokenGrid, TokenGridFallback } from '@/app/comps/token_grid'
import { ExploreNav } from '@/app/comps/explore_nav'
import { Events } from '@/app/comps/events'

export const dynamic = 'force-dynamic'

type Props = {
	searchParams: Promise<SearchParams>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', query = '' } = searchParams

	const tokenPromise = getTokens({ sortOrder, sortType, cursorId })

	return (
		<div className="w-full max-w-[600px] border-white border-x-1 border-opacity-[0.125]">
			<Events />

			<div
				className="sticky top-0 h-[52px]  flex items-center z-40 w-full backdrop-blur 
                  max-w-[600px] frost"
			>
				<ExploreNav searchParams={{ sortType, sortOrder, query }} />
			</div>

			<div className="relative mx-auto flex max-w-[600px] flex-col pb-0 border-x border-white border-opacity-[0.125]">
				<section className="p-0 ">
					<Suspense
						key={[sortType, sortOrder].toString()}
						fallback={
							<ul className="mx-auto grid w-full grid-cols-1 gap-0">
								<TokenGridFallback />
							</ul>
						}
					>
						<TokenGrid tokenPromise={tokenPromise} />
					</Suspense>
				</section>
			</div>
		</div>
	)
}
