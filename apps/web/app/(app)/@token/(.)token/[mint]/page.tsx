import { Suspense } from 'react'
import { IntervalPanel } from '@/app/comps/interval_panel'
import { Loading } from '@/app/comps/loading'
import Image from 'next/image'

import { getCandlstickData } from '@/app/data/get_candlestick_data'
import { CandlestickChart } from '@/app/comps/candlestick_chart'

import { getTokenFeed } from '@/app/data/get_token_feed'

import { Tabs, List, Trigger, Content } from '@/app/comps/tabs'
import { Button } from '@/app/comps/button'

import { TransactionTable } from '@/app/comps/transaction_table'
import { getTransactionData } from '@/app/data/get_transaction_data'
import { HoldersTable } from '@/app/comps/holders_table'
import { getTopHolders } from '@/app/data/get_top_holders'

import { TokenPair, TokenPairFallback } from '@/app/comps/token_pair'
import { Back } from '@/app/comps/back'

import { getComments } from '@/app/data/get_comments'
import { Comments } from '@/app/comps/comments'
import { ReplyForm } from '@/app/comps/reply_form'
import { TokenSearchParamsSchema } from '@/app/utils/schemas'
import { MobileDrawer } from '@/app/comps/mobile_drawer'
import { SwapForm, SwapFormFallback } from '@/app/comps/swap_form'

export const dynamic = 'force-dynamic'

type Props = {
	params: Promise<{ mint: string }>
	searchParams: Promise<{ [key: string]: string }>
}

export default async function Page(props: Props) {
	const [{ mint }, searchParams] = await Promise.all([props.params, props.searchParams])

	const parse = TokenSearchParamsSchema.safeParse(searchParams)

	if (parse.error) {
		return <div>incorrect search params</div>
	}

	const { interval } = parse.data

	const ohlcPromise = getCandlstickData(mint, interval)

	const tokenPromise = getTokenFeed(mint)

	const transactionPromise = getTransactionData(mint)

	const holdersPromise = getTopHolders(mint)

	const commentsPromise = getComments(mint)

	return (
		<div className="flex flex-col w-full min-h-[100vh] border-x border-white border-opacity-[0.125] bg-background-100 relative max-w-[600px]">
			<div className="sticky top-0 h-[52px] flex items-center z-50 w-full backdrop-blur">
				<Back />
			</div>
			<div className="relative overflow-y-hidden flex-1 overflow-x-hidden pb-40 w-full">
				<div className="border-t border-white border-opacity-[0.125] h-fit min-h-[255px] w-full">
					<div className="flex items-center justify-between p-3 border-b border-white border-opacity-[0.125]">
						<Suspense fallback={<TokenPairFallback />}>
							<TokenPair tokenPromise={tokenPromise} />
						</Suspense>
						<IntervalPanel mint={mint} />
					</div>

					<Suspense fallback={<Loading i={0} className="h-[255px] w-[600px]" />}>
						<CandlestickChart ohlcPromise={ohlcPromise} mint={mint} interval={interval} />
					</Suspense>
				</div>

				<Tabs className="relative z-0 flex flex-col">
					<List className="flex items-center px-2 h-[40px]">
						<Trigger value="tab1" asChild>
							<Button className="data-[state=active]:border-white border-b border-transparent" variant="chart">
								Transactions
							</Button>
						</Trigger>

						<Trigger value="tab2" asChild>
							<Button className="data-[state=active]:border-white border-b border-transparent" variant="chart">
								Holders
							</Button>
						</Trigger>
					</List>

					<Content
						value="tab1"
						forceMount
						className="data-[state=inactive]:hidden data-[state=inactive]:absolute data-[state=inactive]:pointer-events-none max-h-[172px]"
					>
						<Suspense fallback={<Loading i={1} className="w-full h-[172px] " />}>
							<TransactionTable transactionPromise={transactionPromise} tokenPromise={tokenPromise} />
						</Suspense>
					</Content>

					<Content
						value="tab2"
						forceMount
						className="data-[state=inactive]:hidden data-[state=inactive]:absolute data-[state=inactive]:pointer-events-none max-h-[172px]"
					>
						<Suspense fallback={<Loading i={2} className="w-full h-[172px] overflow-hidden " />}>
							<HoldersTable holdersPromise={holdersPromise} />
						</Suspense>
					</Content>
				</Tabs>

				<ReplyForm mint={mint} />

				<Suspense>
					<Comments mint={mint} commentsPromise={commentsPromise} />
				</Suspense>
			</div>

			<MobileDrawer
				trigger={
					<div
						className="z-40 sticky bottom-[calc(52px+32px)] w-full lg:hidden

  "
					>
						<div className="flex justify-end pr-8">
							<Button className="ml-auto pointer-events-auto rounded-full border border-white border-opacity-[0.125] bg-background-100">
								<Image src="/rage.png" alt="logo" width={56} height={56} />
							</Button>
						</div>
					</div>
				}
			>
				<Suspense fallback={<SwapFormFallback />}>
					<SwapForm tokenPromise={tokenPromise} />
				</Suspense>
			</MobileDrawer>
		</div>
	)
}
