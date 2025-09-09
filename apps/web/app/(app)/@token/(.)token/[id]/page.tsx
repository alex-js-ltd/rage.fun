import { Suspense, Fragment, cache, use } from 'react'
import { Interval, IntervalPanel } from '@/app/comps/interval_panel'
import { Loading } from '@/app/comps/loading'
import { Icon } from '@/app/comps/_icon'
import Link from 'next/link'

import { getCandlstickData } from '@/app/data/get_candlestick_data'
import { CandlestickChart } from '@/app/comps/candlestick_chart'

import { getTokenWithRelations } from '@/app/data/get_token'

import { SwapForm, SwapFormFallback } from '@/app/comps/swap_form'

import { Tabs, List, Trigger, Content } from '@/app/comps/tabs'
import { Button } from '@/app/comps/button'

import { HarvestYieldForm } from '@/app/comps/harvest_yield_form'
import { getTradingFeeYield } from '@/app/data/get_trading_fee_yield'

import { TransactionTable } from '@/app/comps/transaction_table'
import { getTransactionData } from '@/app/data/get_transaction_data'
import { HoldersTable } from '@/app/comps/holders_table'
import { getTopHolders } from '@/app/data/get_top_holders'

import type { Metadata, ResolvingMetadata } from 'next'
import { getCachedTokenMetadata } from '@/app/data/get_token_metadata'
import { generateSolanaBlink } from '@/app/utils/misc'
import { TokenPair, TokenPairFallback } from '@/app/comps/token_pair'
import { Back } from '@/app/comps/back'

import { getComments } from '@/app/data/get_comments'
import { Comments } from '@/app/comps/comments'
import { ReplyForm } from '@/app/comps/reply_form'

export const dynamic = 'force-dynamic'

type Props = {
	params: Promise<{ id: string }>
	searchParams: Promise<{ interval: Interval }>
}

export default async function Page(props: Props) {
	const [{ id: mint }, searchParams] = await Promise.all([props.params, props.searchParams])

	const interval = searchParams.interval ?? '86400000'

	const ohlcPromise = getCandlstickData(mint, interval)

	const tokenPromise = getTokenWithRelations(mint)

	const transactionPromise = getTransactionData(mint)

	const holdersPromise = getTopHolders(mint)

	const blink = generateSolanaBlink(mint)

	const commentsPromise = getComments(mint)

	return (
		<div className="flex flex-col w-full min-h-[100vh] border-x border-white border-opacity-[0.125] bg-background-100">
			<div
				className="sticky top-0 h-[52px] flex items-center z-50 w-full
							  bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60
							  max-w-[600px] "
			>
				<Back />
			</div>

			<div className="border-t border-white border-opacity-[0.125] h-fit min-h-[255px] w-full">
				<div className="flex items-center justify-between p-3 border-b border-white border-opacity-[0.125]">
					<Suspense fallback={<TokenPairFallback />}>
						<TokenPair tokenPromise={tokenPromise} />
					</Suspense>
					<IntervalPanel mint={mint} />
				</div>

				<Suspense fallback={<Loading i={0} className="h-[255px] w-full" />}>
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
	)
}
