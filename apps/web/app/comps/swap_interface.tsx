'use client'

import { type ReactNode, useActionState, use, useEffect, useState } from 'react'

import { Tabs, List, Trigger, Content } from '@/app/comps/tabs'
import { Button } from '@/app/comps/button'

import { usePayer } from '@/app/hooks/use_payer'
import { useForm, FormProvider, getFormProps, useInputControl } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { SwapSchema } from '@/app/utils/schemas'
import { buyAction, sellAction } from '@/app/actions/swap_action'
import { Input } from '@/app/comps/input'

import { type ImageProps, TokenLogo, getTokenLogoProps, solLogoProps } from './token_logo'
import { type SubmitButtonProps, SubmitButton } from '@/app/comps/submit_button'

import { Loading } from '@/app/comps/loading'
import { Toast } from '@/app/comps/toast'
import { type ToastDescription as ToastConfig, useToast } from '@/app/hooks/use_toast'
import { useSignAndSendTx } from '@/app/hooks/use_sign_and_send_tx'

import { type TokenWithRelationsType } from '@/app/utils/schemas'

import { useDebounceCallback } from 'usehooks-ts'
import { useAsync } from '@/app/hooks/use_async'
import { client } from '@/app/utils/client'
import { useLatestRef } from '@/app/hooks/use_latest_ref'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'

import * as SwitchPrimitive from '@radix-ui/react-switch'

export interface SwapInterfaceProps {
	tokenPromise: Promise<TokenWithRelationsType>
}

interface FormProps {
	badge: ReactNode
	mint: string
	decimals: number
	action: typeof buyAction | typeof sellAction

	toastConfig: ToastConfig
	receive: string
	wasmAction: typeof calculateBuyAmount | typeof calculateSellPrice

	progress: number
}

async function calculateBuyAmount(params: URLSearchParams): Promise<string> {
	return client<string>(`/api/wasm/calculate_buy_amount?${params.toString()}`, { cache: 'no-store' })
}

async function calculateSellPrice(params: URLSearchParams): Promise<string> {
	return client<string>(`/api/wasm/calculate_sell_price?${params.toString()}`, { cache: 'no-store' })
}

export function SwapForm() {
	const [side, setSide] = useState<'buy' | 'sell'>('buy')

	return (
		<form className="space-y-3">
			{/* Switch track */}
			<SwitchPrimitive.Root
				id="buy-sell"
				checked={side === 'sell'}
				onCheckedChange={c => setSide(c ? 'sell' : 'buy')}
				className="relative h-10 w-full rounded-full border border-white/10 bg-white/[0.04] outline-none
                   focus-visible:ring-2 focus-visible:ring-white/20"
				style={{ WebkitTapHighlightColor: 'transparent' }}
			>
				{/* Sliding pill (50% width) */}
				<div
					aria-hidden
					className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-white/[0.08]
                      transition-all duration-300 ease-out
                      ${side === 'buy' ? 'left-1' : 'left-[calc(50%)]'}`}
				/>

				{/* Keep Thumb for a11y, but hide visually */}
				<SwitchPrimitive.Thumb className="sr-only" />

				{/* Labels overlay */}
				<div className="pointer-events-none absolute inset-0 grid grid-cols-2 place-items-center text-sm font-medium">
					<span className={side === 'buy' ? 'text-emerald-300' : 'text-white/70'}>Buy</span>
					<span className={side === 'sell' ? 'text-rose-300' : 'text-white/70'}>Sell</span>
				</div>
			</SwitchPrimitive.Root>

			{/* If you need to submit via <form>, keep the side in an input */}
			<input type="hidden" name="side" value={side} />
		</form>
	)
}
