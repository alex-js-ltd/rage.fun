import { Suspense } from 'react'
import { SwapForm, SwapFormFallback } from '@/app/comps/swap_form'
import { getCachedTokenFeed } from '@/app/data/get_token_feed'

type Props = {
	params: Promise<{ mint: string }>
}

export default async function Page(props: Props) {
	const { mint } = await props.params

	const tokenPromise = getCachedTokenFeed(mint)

	return (
		<div className="relative w-full justify-self-start">
			<div className="sticky top-[5px] z-40 flex flex-col mt-[5px]">
				<Suspense fallback={<SwapFormFallback />}>
					<SwapForm tokenPromise={tokenPromise} />
				</Suspense>
			</div>
		</div>
	)
}
