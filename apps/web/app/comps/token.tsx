import { Suspense } from 'react'
import { IntervalPanel } from '@/app/comps/interval_panel'
import { Loading } from '@/app/comps/loading'
import Image from 'next/image'

import { getCandlstickData } from '@/app/data/get_candlestick_data'
import { CandlestickChart } from '@/app/comps/candlestick_chart'

import { Tabs, List, Trigger, Content } from '@/app/comps/tabs'
import { Button } from '@/app/comps/button'

import { TransactionTable } from '@/app/comps/transaction_table'
import { getTransactionTable } from '@/app/data/get_transaction_data'
import { HoldersTable } from '@/app/comps/holders_table'
import { getTopHolders } from '@/app/data/get_top_holders'

import { TokenPair, TokenPairFallback } from '@/app/comps/token_pair'

import { getComments } from '@/app/data/get_comments'
import { Comments } from '@/app/comps/comments'
import { ReplyForm } from '@/app/comps/reply_form'
import { TokenSearchParamsSchema } from '@/app/utils/schemas'
import { MobileDrawer } from '@/app/comps/mobile_drawer'
import { SwapForm, SwapFormFallback } from '@/app/comps/swap_form'
import { Header } from '@/app/comps/header'
import { generateSolanaBlink } from '@/app/utils/dialect'
import { getPnLForToken } from '@/app/data/get_pnl_for_token'
import { PnLTable } from '@/app/comps/pnl_table'

import { getSwapConfig } from '@/app/data/get_swap_config'
import { getTokenLogo } from '@/app/data/get_token_logo'

type Props = {
	params: Promise<{ mint: string }>
	searchParams: Promise<{ [key: string]: string }>
}

export async function Token(props: Props) {
	const [{ mint }, searchParams] = await Promise.all([props.params, props.searchParams])

	const parse = TokenSearchParamsSchema.safeParse(searchParams)

	const interval = parse.error ? 300000 : parse.data.interval

	const chartPromise = getCandlstickData(mint, interval)

	const swapConfigPromise = getSwapConfig(mint)

	const transactionPromise = getTransactionTable(mint)

	const holdersPromise = getTopHolders(mint)

	const commentsPromise = getComments(mint)

	const blink = generateSolanaBlink(mint)

	const pnlPromise = getPnLForToken(mint)

	const tokenLogoPromise = getTokenLogo(mint)

	return (
		<div className="flex flex-col w-full min-h-[100vh] border-x border-white border-opacity-[0.125] bg-background-100 relative max-w-[600px]">
			<Header />

			<div className="relative overflow-y-hidden flex-1 overflow-x-hidden pb-40 w-full">
				<div className="border-t border-white border-opacity-[0.125] h-fit min-h-[255px] w-full">
					<div className="flex items-center justify-between h-[52px] border-b border-white border-opacity-[0.125] pl-3">
						<Suspense fallback={<TokenPairFallback />}>
							<TokenPair tokenLogoPromise={tokenLogoPromise} />
						</Suspense>

						<Suspense fallback={null}>
							<IntervalPanel key={`${mint}-${interval}`} mint={mint} searchParams={searchParams} />
						</Suspense>
					</div>

					<Suspense key={`${mint}-${interval}`} fallback={<Loading i={1} className="z-50 h-[255px] w-[600px]" />}>
						<CandlestickChart key={`${mint}-${interval}`} chartPromise={chartPromise} mint={mint} interval={interval} />
					</Suspense>
				</div>

				<Tabs className="relative z-0 flex flex-col">
					<List className="flex items-center px-2 h-[40px] border-white border-b border-opacity-[0.125]">
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

						<Trigger value="tab3" asChild>
							<Button className="data-[state=active]:border-white border-b border-transparent" variant="chart">
								PnL
							</Button>
						</Trigger>
					</List>

					<Content
						value="tab1"
						forceMount
						className="data-[state=inactive]:absolute data-[state=inactive]:opacity-0 data-[state=inactive]:pointer-events-none max-h-[172px]"
					>
						<Suspense fallback={<Loading i={1} className="w-full h-[172px] " />}>
							<TransactionTable transactionPromise={transactionPromise} tokenLogoPromise={tokenLogoPromise} />
						</Suspense>
					</Content>

					<Content
						value="tab2"
						forceMount
						className="data-[state=inactive]:absolute data-[state=inactive]:opacity-0 data-[state=inactive]:pointer-events-none max-h-[172px]"
					>
						<Suspense fallback={<Loading i={2} className="w-full h-[172px] overflow-hidden " />}>
							<HoldersTable holdersPromise={holdersPromise} />
						</Suspense>
					</Content>

					<Content
						value="tab3"
						forceMount
						className="data-[state=inactive]:absolute data-[state=inactive]:opacity-0 data-[state=inactive]:pointer-events-none max-h-[172px]"
					>
						<Suspense fallback={<Loading i={2} className="w-full h-[172px] overflow-hidden " />}>
							<PnLTable pnlPromise={pnlPromise} />
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
					<div className="z-50 sticky bottom-[calc(52px+16px)] sm:bottom-4 w-full lg:hidden">
						<div className="flex justify-end pr-4">
							<Button className="ml-auto pointer-events-auto rounded-full border border-white border-opacity-[0.125] bg-rage-100">
								<Image src="/rage.png" alt="logo" width={56} height={56} />
							</Button>
						</div>
					</div>
				}
			>
				<Suspense fallback={<SwapFormFallback />}>
					<SwapForm swapConfigPromise={swapConfigPromise} />
				</Suspense>
			</MobileDrawer>
		</div>
	)
}
