import { Suspense } from 'react'
import { SearchField, SearchResults } from '@/app/comps/search'
import { searchTokens } from '@/app/data/search_tokens'
import { type SearchParams } from '@/app/utils/schemas'

export const dynamic = 'force-dynamic'

type Props = {
	searchParams: Promise<SearchParams>
}

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', search = '' } = searchParams

	const searchPromise = searchTokens(search)

	return (
		<div className="relative w-full">
			<div className="sticky top-0 z-40 flex flex-col">
				<div className="flex h-[52px] items-center">
					<SearchField />
				</div>

				<Suspense>
					<SearchResults searchPromise={searchPromise} />
				</Suspense>
			</div>
		</div>
	)
}
