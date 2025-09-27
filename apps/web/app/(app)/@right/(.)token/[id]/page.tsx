import { Suspense } from 'react'
import { type QuickOption, SwapForm, SwapFormFallback } from '@/app/comps/swap_form'
import { getTokenWithRelations } from '@/app/data/get_token'
import { Interval, IntervalPanel } from '@/app/comps/interval_panel'
import { getQuickSellOptions } from '@/app/data/get_quick_sell_options'
import { getQuickBuyOptions } from '@/app/data/get_quick_buy_options'
import { auth } from '@/app/auth'

type Props = {
	params: Promise<{ id: string }>
}

export default async function Page(props: Props) {
	const { id: mint } = await props.params

	const tokenPromise = getTokenWithRelations(mint)

	const session = await auth()
	const quickSellOptionsPromise: Promise<QuickOption[]> = getQuickSellOptions(mint, session?.user?.id)
	const quickBuyOptionsPromise: Promise<QuickOption[]> = getQuickBuyOptions(session?.user?.id)

	return (
		<div className="relative w-full justify-self-start">
			<div className="sticky top-[5px] z-40 flex flex-col mt-[5px]">
				<Suspense fallback={<SwapFormFallback />}>
					<SwapForm
						tokenPromise={tokenPromise}
						quickBuyOptionsPromise={quickBuyOptionsPromise}
						quickSellOptionsPromise={quickSellOptionsPromise}
					/>
				</Suspense>
			</div>
		</div>
	)
}
