'use client'

import { useActionState, useEffect, use } from 'react'

import { useForm, getFormProps, getInputProps, FormProvider } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'

import { HarvestYieldSchema } from '@/app/utils/schemas'
import { type State, harvestYieldAction } from '@/app/actions/harvest_yield_action'
import { usePayer } from '@/app/hooks/use_payer'

import { Toast } from '@/app/comps/toast'
import { type ToastDescription, useToast } from '@/app/hooks/use_toast'
import { useSignAndSendTx } from '@/app/hooks/use_sign_and_send_tx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/comps/tooltip'

import { type TokenFeedType } from '@/app/utils/schemas'
import { formatNumberSmart } from '@/app/utils/misc'

const initialState: State = {}

interface HarvestYieldProps {
	token: TokenFeedType
}

export function HarvestYieldForm({ token }: HarvestYieldProps) {
	const [lastResult, formAction, isPending] = useActionState(harvestYieldAction, initialState)

	const [form, fields] = useForm({
		// Reuse the validation logic on the client
		onValidate({ formData }) {
			return parseWithZod(formData, {
				// client side validation
				schema: HarvestYieldSchema,
			})
		},

		// Validate the form on blur event triggered
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		lastResult,
	})

	const { serializedTx, errMessage } = lastResult || {}

	const harvest = useSignAndSendTx(serializedTx)
	const { isSuccess, setError } = harvest

	useEffect(() => {
		if (errMessage) {
			setError(errMessage)
		}
	}, [errMessage, setError])

	const { getToastProps } = useToast(harvest)

	const payer = usePayer()

	const config = { loading: `Harvesting ${token.metadata.symbol}`, success: `Harvest confirmed` }

	const disabled = isPending || harvest.isLoading || token.bondingCurve.tradingFees === 0

	if (typeof payer === 'string' && payer !== token.creatorId) {
		throw new Error('only the token creator can harvestthe yield')
	}

	return (
		<div className="">
			<form className="ml-auto w-fit" key={form.key} action={formAction} {...getFormProps(form)}>
				{/* hidden inputs */}
				<input name="creator" type="hidden" defaultValue={payer} />
				<input name="mint" type="hidden" defaultValue={token.id} />

				<Tooltip>
					<TooltipTrigger asChild>
						<button
							className="bg-background-500 hover:bg-background-600 rounded-full p-4 h-[34px] flex items-center font-semibold"
							aria-label="Harvest Yield"
							disabled={disabled}
							type="submit"
						>
							${formatNumberSmart(token.bondingCurve.tradingFees)}
						</button>
					</TooltipTrigger>

					<TooltipContent variant={'submit_3'} side="bottom" sideOffset={6}>
						Harvest Yield
					</TooltipContent>
				</Tooltip>
			</form>

			<Toast {...getToastProps(config)} />
		</div>
	)
}
