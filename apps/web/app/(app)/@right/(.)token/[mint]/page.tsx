import { Suspense } from 'react'
import { SwapForm, SwapFormFallback } from '@/app/comps/swap_form'

import { getTopHolders } from '@/app/data/get_top_holders'
import { getSwapConfig } from '@/app/data/get_swap_config'

type Props = {
	params: Promise<{ mint: string }>
}

export default async function Page(props: Props) {
	const { mint } = await props.params

	const holdersPromise = getTopHolders(mint)

	const swapConfigPromise = getSwapConfig(mint)

	return (
		<div className="relative w-full justify-self-start">
			<div className="sticky top-[5px] z-40 flex flex-col mt-[5px]">
				<Suspense fallback={<SwapFormFallback />}>
					<SwapForm swapConfigPromise={swapConfigPromise} />
				</Suspense>
			</div>
		</div>
	)
}
