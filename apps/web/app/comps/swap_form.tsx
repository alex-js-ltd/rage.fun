'use client'

import { type ReactNode, useActionState, use, useEffect, useState, useCallback, Suspense } from 'react'

import { Tabs, List, Trigger, Content } from '@/app/comps/tabs'
import { Button } from '@/app/comps/button'

import { usePayer } from '@/app/hooks/use_payer'
import { useForm, FormProvider, getFormProps, useInputControl } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { SwapSchema, WasmType } from '@/app/utils/schemas'
import { buyAction, sellAction } from '@/app/actions/swap_action'
import { Input } from '@/app/comps/input'

import { type ImageProps, TokenLogo, getTokenLogoProps, solLogoProps } from './token_logo'

import { Loading } from '@/app/comps/loading'
import { Toast } from '@/app/comps/toast'
import { type ToastDescription as ToastConfig, useToast } from '@/app/hooks/use_toast'
import { useSignAndSendTx } from '@/app/hooks/use_sign_and_send_tx'

import { type TokenFeedType } from '@/app/utils/schemas'

import { useDebounceValue } from 'usehooks-ts'
import { useAsync } from '@/app/hooks/use_async'
import { client } from '@/app/utils/client'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'
import { ConnectWallet } from '@/app/comps/connect_wallet'

import { Progress } from '@/app/comps/progress'
import { formatCompactNumber } from '../utils/misc'
import { fromLamports } from '@repo/rage'
import { BN } from '@coral-xyz/anchor'
import { amountToUiAmount } from '@repo/rage'

export interface SwapFormProps {
	tokenPromise: Promise<TokenFeedType>
}

interface FormProps {
	badge: ReactNode
	mint: string
	decimals: number
	action: typeof buyAction | typeof sellAction

	toastConfig: ToastConfig
	receive: string

	getQuote: (uiAmount: string) => Promise<string>
	displayQuote: (amount: string) => string

	getQuickOption: (params: URLSearchParams) => Promise<string>
}

async function calculateBuyAmount(params: WasmType): Promise<string> {
	return client<string>(`/api/wasm/calculate_buy_amount`, {
		method: 'POST',
		body: JSON.stringify(params),
		headers: {
			'Content-Type': 'application/json',
		},
		cache: 'no-store',
	})
}

async function calculateSellPrice(params: WasmType): Promise<string> {
	return client<string>(`/api/wasm/calculate_sell_price`, {
		method: 'POST',
		body: JSON.stringify(params),
		headers: {
			'Content-Type': 'application/json',
		},
		cache: 'no-store',
	})
}

async function getQuickOptionForBuy(params: URLSearchParams): Promise<string> {
	return client<string>(`/api/quick_option/buy?${params}`, {
		method: 'GET',
	})
}

async function getQuickOptionForSell(params: URLSearchParams): Promise<string> {
	return client<string>(`/api/quick_option/sell?${params}`, {
		method: 'GET',
	})
}

export function SwapForm({ tokenPromise }: SwapFormProps) {
	const token = use(tokenPromise)

	const [state, setState] = useState(token)

	const { channel } = useChannel('updateEvent', (message: Ably.Message) => {
		const updateEvent: TokenFeedType = message.data

		if (updateEvent.id === state.id) {
			setState(updateEvent)
		}
	})

	const { id: mint } = state

	const [tab, setTab] = useState<'buy' | 'sell'>('buy') // you control it

	return (
		<>
			<Tabs value={tab} onValueChange={v => setTab(v as 'buy' | 'sell')} className="relative flex flex-col gap-4 ">
				<List className="relative flex items-center gap-2 justify-between border border-white border-opacity-[0.125] rounded-full h-[40px]">
					<Trigger value="buy" asChild className="flex-1">
						<button className="data-[state=active]:text-buy-100 font-semibold text-white/70 cursor-pointer ">
							Buy
						</button>
					</Trigger>

					<Trigger value="sell" asChild className="flex-1">
						<button className="data-[state=active]:text-sell-100 text-white/70 cursor-pointer font-semibold">
							Sell
						</button>
					</Trigger>

					{/* Sliding pill (50% width) */}
					<div
						aria-hidden
						className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-white/[0.08]
                      transition-all duration-300 ease-out
                      ${tab === 'buy' ? 'left-1' : 'left-[calc(50%)]'}`}
					/>
				</List>

				<Content
					value="buy"
					forceMount
					className="data-[state=inactive]:hidden data-[state=inactive]:absolute data-[state=inactive]:pointer-events-none"
				>
					<Buy token={state} />
				</Content>

				<Content
					value="sell"
					forceMount
					className="data-[state=inactive]:hidden data-[state=inactive]:absolute data-[state=inactive]:pointer-events-none"
				>
					<Sell token={state} />
				</Content>
			</Tabs>

			<div className="py-8">
				<div className="h-[2px] w-full border-b-[2px] border-white opacity-[0.125]" />
			</div>

			<Progress mint={mint} progress={state.marketData.progress} />
		</>
	)
}

function Buy({ token }: { token: TokenFeedType }) {
	const { id: mint } = token
	const { symbol } = token.metadata

	const {
		virtualReserve,
		currentReserve,
		targetReserve,
		virtualSupply,
		currentSupply,
		targetSupply,
		connectorWeight,
		decimals,
	} = token.bondingCurve

	const getQuote = useCallback(
		async (uiAmount: string) => {
			const params = {
				uiAmount,
				virtualReserve,
				currentReserve,
				targetReserve,
				virtualSupply,
				currentSupply,
				targetSupply,
				connectorWeight,
				decimals,
			}

			if (uiAmount === '' || uiAmount === '0') {
				return ''
			}
			const quote = await calculateBuyAmount(params)

			return quote
		},
		[
			virtualReserve,
			currentReserve,
			targetReserve,
			virtualSupply,
			currentSupply,
			targetSupply,
			connectorWeight,
			decimals,
		],
	)

	return (
		<Form
			badge={<TokenBadge {...solLogoProps} />}
			mint={mint}
			decimals={9}
			action={buyAction}
			toastConfig={{ loading: `Minting ${symbol}`, success: `Mint confirmed` }}
			receive={symbol}
			getQuote={getQuote}
			displayQuote={(quote: string) => {
				if (!quote) return `0`
				const uiAmount = amountToUiAmount(new BN(quote), decimals)
				return formatCompactNumber(Number(uiAmount))
			}}
			getQuickOption={getQuickOptionForBuy}
		/>
	)
}

function Sell({ token }: { token: TokenFeedType }) {
	const { id: mint } = token
	const { symbol } = token.metadata

	const {
		virtualReserve,
		currentReserve,
		targetReserve,
		virtualSupply,
		currentSupply,
		targetSupply,
		connectorWeight,
		decimals,
	} = token.bondingCurve

	const getQuote = useCallback(
		async (uiAmount: string) => {
			const params = {
				uiAmount,
				virtualReserve,
				currentReserve,
				targetReserve,
				virtualSupply,
				currentSupply,
				targetSupply,
				connectorWeight,
				decimals,
			}

			if (uiAmount === '' || uiAmount === '0') {
				return ''
			}
			const quote = await calculateSellPrice(params)
			return quote
		},
		[
			virtualReserve,
			currentReserve,
			targetReserve,
			virtualSupply,
			currentSupply,
			targetSupply,
			connectorWeight,
			decimals,
		],
	)

	return (
		<Form
			badge={<TokenBadge {...getTokenLogoProps(token.metadata)} className="size-8 rounded-full" />}
			mint={mint}
			decimals={decimals}
			action={sellAction}
			toastConfig={{ loading: `Burning ${symbol}`, success: `Burn confirmed` }}
			receive="SOL"
			getQuote={getQuote}
			displayQuote={(quote: string) => {
				if (!quote) return `0`
				const uiAmount = fromLamports(new BN(quote), 9)
				return uiAmount.toFixed(9)
			}}
			getQuickOption={getQuickOptionForSell}
		/>
	)
}

function Form({
	badge,
	decimals,
	mint,
	action,
	toastConfig,
	receive,
	getQuote,
	displayQuote,
	getQuickOption,
}: FormProps) {
	const [lastResult, formAction, isPending] = useActionState(action, undefined)

	const { serializedTx, errMessage, requestId, ...rest } = lastResult || {}

	const [amount, setAmount] = useState('')

	const swap = useSignAndSendTx(serializedTx)

	const { setError, reset, isLoading, isSuccess } = swap

	useEffect(() => {
		if (errMessage) {
			setError(errMessage)
		}
	}, [errMessage, setError, requestId])

	useEffect(() => {
		if (isSuccess) {
			setAmount('')
		}
	}, [isSuccess])

	const { getToastProps } = useToast(swap)

	const payer = usePayer()

	const { run, data: quote, setData } = useAsync<string | null>()

	const [uiAmount] = useDebounceValue(amount, 300)

	useEffect(() => {
		if (typeof uiAmount !== 'string') return

		const promise = getQuote(uiAmount)

		run(promise)
	}, [uiAmount, getQuote, run])

	// One place that decides what “reset/25/50/100” means for the input
	const onQuickOptionSelect = useCallback(
		async (percent: number) => {
			if (percent === 0 || !payer) {
				// reset
				setAmount('')
				return
			}

			const params = new URLSearchParams({
				mint,
				percent: percent.toString(),
			})

			const v = await getQuickOption(params) // server-calculated uiAmount string

			if (v === '0') {
				setAmount('')
			} else {
				setAmount(v)
			}
		},
		[amount, getQuickOption, mint, payer],
	)

	return (
		<>
			<div className="relative z-10 flex w-full flex-col divide-zinc-600 ">
				<form className="relative transition-colors flex w-full flex-col gap-4" action={formAction}>
					<input name="payer" type="hidden" defaultValue={payer} />
					<input name="mint" type="hidden" defaultValue={mint} />
					<input name="decimals" type="hidden" defaultValue={decimals} />
					{quote && <input name="quote" type="hidden" defaultValue={quote} />}
					<div className="relative transition-colors flex gap-2 items-center rounded-full border border-white border-opacity-[0.125] cursor-default">
						<Input
							variant="amount"
							{...getPlaceholder(decimals)}
							type="number"
							name="amount"
							inputMode="numeric"
							value={amount}
							onChange={e => {
								setAmount(e.target.value)
							}}
						/>

						{badge}
					</div>

					<QuickOptions onQuickOptionSelect={onQuickOptionSelect} />

					{payer ? (
						<Button
							className={uiAmount ? 'bg-background-600' : undefined}
							disabled={isPending || isLoading}
							type="submit"
							variant="trade"
						>
							Place Trade
						</Button>
					) : (
						<ConnectWallet
							overrideContent={
								<Button className="w-full h-[40px] flex items-center justify-center text-text-400 font-semibold rounded-full bg-background-500 ">
									Connect
								</Button>
							}
							currentUserClassName="button"
						/>
					)}

					<span className="absolute -bottom-6 text-xs text-teal-300 w-full right-0 text-end">
						{quote ? `Quote: ${displayQuote(quote)} ${receive ?? ''}` : ''}
					</span>
				</form>
			</div>

			<Toast {...getToastProps(toastConfig)} />
		</>
	)
}

function getPlaceholder(decimals: number) {
	return {
		placeholder: '0.' + '0'.repeat(decimals),
	}
}

function TokenBadge(props: ImageProps) {
	return (
		<div className="pr-2">
			<TokenLogo {...props} className="size-6 rounded-full" />
		</div>
	)
}

const quickOptions = [
	{
		label: 'Reset',
		value: 0,
	},
	{ label: '25%', value: 25 },
	{ label: '50%', value: 50 },
	{ label: 'Max', value: 100 },
]

function QuickOptions({ onQuickOptionSelect }: { onQuickOptionSelect: (percent: number) => Promise<void> }) {
	const { run, isLoading } = useAsync<void>()

	return (
		<ul className="flex gap-2 items-center">
			{quickOptions.map(o => (
				<li key={o.label} className="flex-1">
					<Button
						disabled={isLoading}
						type="button"
						onClick={() => {
							const promise = onQuickOptionSelect(o.value)
							run(promise)
						}}
						variant="interval"
						className="bg-background-100 w-full"
					>
						{o.label}
					</Button>
				</li>
			))}
		</ul>
	)
}

function QuickOptionsFallback() {
	return (
		<ul className="flex gap-2 items-center">
			{Array.from({ length: 4 }, (_, i) => (
				<li key={`loading-option-${i}`} className="flex-1">
					<Loading className="w-full rounded-full h-6" i={i} />
				</li>
			))}
		</ul>
	)
}

export function SwapFormFallback() {
	const tab = 'buy'

	return (
		<>
			<Tabs value={tab} className="relative flex flex-col gap-4 ">
				<List className="relative flex items-center gap-2 justify-between border border-white border-opacity-[0.125] rounded-full h-[40px]">
					<Trigger value="buy" asChild className="flex-1">
						<button className="data-[state=active]:text-emerald-400 font-semibold text-white/70 cursor-pointer pointer-events-none ">
							Buy
						</button>
					</Trigger>

					<Trigger value="sell" asChild className="flex-1">
						<button className="data-[state=active]:text-red-400 text-white/70 cursor-pointer font-semibold pointer-events-none">
							Sell
						</button>
					</Trigger>

					{/* Sliding pill (50% width) */}
					<div
						aria-hidden
						className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-white/[0.08]
                      transition-all duration-300 ease-out
                      ${tab === 'buy' ? 'left-1' : 'left-[calc(50%)]'}`}
					/>
				</List>

				<Content
					value="buy"
					forceMount
					className="data-[state=inactive]:hidden data-[state=inactive]:absolute data-[state=inactive]:pointer-events-none"
				>
					<div className="relative z-10 flex w-full flex-col divide-zinc-600 ">
						<form className="relative transition-colors flex w-full flex-col gap-4">
							<div className="relative transition-colors flex gap-2 items-center rounded-full border border-white border-opacity-[0.125] cursor-default">
								<Input variant="amount" {...getPlaceholder(9)} type="number" name="amount" inputMode="numeric" />

								<Loading i={0} className="size-6 rounded-full mr-2" />
							</div>

							<QuickOptionsFallback />

							<Button type="submit" variant="trade">
								Place Trade
							</Button>

							<span className="absolute -bottom-6 text-xs text-teal-300 w-full right-0 text-end"></span>
						</form>
					</div>
				</Content>

				<Content
					value="sell"
					forceMount
					className="data-[state=inactive]:hidden data-[state=inactive]:absolute data-[state=inactive]:pointer-events-none"
				>
					<div className="relative z-10 flex w-full flex-col divide-zinc-600 ">
						<form className="relative transition-colors flex w-full flex-col gap-4">
							<div className="relative transition-colors flex gap-2 items-center rounded-full border border-white border-opacity-[0.125] cursor-default">
								<Input variant="amount" {...getPlaceholder(9)} type="number" name="amount" inputMode="numeric" />

								<Loading i={0} className="size-6 rounded-full mr-2" />
							</div>

							<Button type="submit" variant="trade">
								Place Trade
							</Button>

							<span className="absolute -bottom-6 text-xs text-teal-300 w-full right-0 text-end"></span>
						</form>
					</div>
				</Content>
			</Tabs>

			<div className="py-8">
				<div className="h-[2px] w-full border-b-[2px] border-white opacity-[0.125]" />
			</div>

			<div className="h-[40px] p-2 border border-white border-opacity-[0.125] rounded-full">
				<Loading i={0} className="h-full rounded-full w-full" />
			</div>
		</>
	)
}
