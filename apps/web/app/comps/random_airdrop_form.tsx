'use client'

import { useActionState, use, useState, useEffect, Suspense } from 'react'
import { useForm, getFormProps, getInputProps, getFieldsetProps } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { RandomAirdropSchema, WalletType } from '@/app/utils/schemas'
import { type State, randomAirdropAction } from '@/app/actions/random_airdrop_action'
import { usePayer } from '@/app/hooks/use_payer'
import { SubmitButton } from '@/app/comps/submit_button'
import { useSignAndSendTx } from '@/app/hooks/use_sign_and_send_tx'
import { Toast } from '@/app/comps/toast'
import { type ToastDescription, useToast } from '@/app/hooks/use_toast'
import { TokenWithRelationsType } from '@/app/utils/schemas'
import { TokenLogo, getTokenLogoProps } from '@/app/comps/token_logo'
import { Select, SelectContent, SelectItem } from './select'
import { Input } from './input'
import { Field } from './field'
import { Button } from './button'
import Image from 'next/image'
import { useChangeSearchParams } from '../hooks/use_change_search_params'
import { getOgUsers } from '../utils/misc'
import { Loading } from './loading'
import { formatCompactNumber } from '@/app/utils/misc'
import { useAsync } from '@/app/hooks/use_async'
import { revalidatePathAction } from '@/app/actions/revalidate_path'

const initialState: State = {
	serializedTx: undefined,
}

interface RandomAirdropFormProps {
	walletPromise: Promise<WalletType[]>
}

const config: ToastDescription = { loading: `Generating airdrop 🧙‍♂️`, success: `Airdrop ready 🚀` }

export function RandomAirdropForm({ walletPromise }: RandomAirdropFormProps) {
	const [lastResult, formAction, isPending] = useActionState(randomAirdropAction, initialState)

	const [mint, setMint] = useState<string | undefined>(undefined)

	const payer = usePayer()

	const [form, fields] = useForm({
		// Reuse the validation logic on the client
		onValidate({ formData }) {
			return parseWithZod(formData, {
				// client side validation
				schema: RandomAirdropSchema,
			})
		},

		defaultValue: {
			mint,
			amount: '2222222.0',
		},

		// Validate the form on blur event triggered
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		lastResult,
	})

	const { serializedTx } = lastResult || {}

	const airdrop = useSignAndSendTx(serializedTx)

	const { isSuccess } = airdrop

	const { getToastProps } = useToast(airdrop)

	const users = fields.users.getFieldList()

	const { createQueryString } = useChangeSearchParams('query')

	useEffect(() => {
		if (typeof payer === 'string') {
			createQueryString(payer)
		}
	}, [payer, createQueryString])

	const { run } = useAsync()

	useEffect(() => {
		const promise = revalidatePathAction(`/airdrop?query=${payer}`)
		run(promise)
	}, [run, isSuccess, payer])

	return (
		<div className="grid pb-10">
			<Suspense fallback={<SelectMintForAirdropFallback />}>
				<SelectMintForAirdrop walletPromise={walletPromise} onValueChange={value => setMint(value)} mint={mint} />
			</Suspense>
			<form key={form.key} className="z-10 h-full w-full min-w-0" {...getFormProps(form)} action={formAction}>
				{/* hidden inputs */}
				<input name="payer" type="hidden" defaultValue={payer} />
				<input name="mint" type="hidden" defaultValue={mint} />

				{users.map((user, index) => {
					return (
						<fieldset
							className="grid grid-cols-[1fr,1fr] overflow-hidden border-l border-white border-opacity-[0.125]"
							key={user.key}
							{...getFieldsetProps(user)}
						>
							<div className="grid bg-background-200 relative">
								<Field
									inputProps={{
										...getInputProps(user, { type: 'text' }),
										placeholder: 'Wallet',
										key: user.key,
									}}
									errors={user.errors}
								/>
							</div>

							<div className="border-b border-r border-white border-opacity-[0.125] grid grid-cols-3 relative ">
								<Button
									variant="airdrop"
									{...form.remove.getButtonProps({
										name: fields.users.name,
										index,
									})}
								>
									Delete
								</Button>
								<Button
									variant="airdrop"
									{...form.reorder.getButtonProps({
										name: fields.users.name,
										from: index,
										to: 0,
									})}
								>
									Move to top
								</Button>
								<Button
									variant="airdrop"
									{...form.update.getButtonProps({
										name: user.name,
										value: '',
									})}
								>
									Clear
								</Button>
							</div>
						</fieldset>
					)
				})}

				<div className="relative h-[69px] border-x border-white border-b border-opacity-[0.125] rounded-b-xl flex items-center">
					<Input
						variant="amount"
						{...getInputProps(fields.amount, { type: 'number' })}
						placeholder="Amount to airdrop (per wallet)"
						key={fields.amount.key}
						inputMode="numeric"
					/>

					<div className="ml-auto flex gap-2 px-3">
						<Button
							disabled={users.length >= 10}
							className="mt-0"
							variant="image"
							{...form.insert.getButtonProps({ name: fields.users.name })}
						>
							Add Wallet
						</Button>

						<SubmitButton content="Submit" isPending={isPending} isLoading={airdrop.isLoading} variant="submit_1" />
					</div>
				</div>
			</form>
			<Toast {...getToastProps(config)} />
		</div>
	)
}

function SelectMintForAirdrop({
	walletPromise,
	onValueChange,
	mint,
}: {
	walletPromise: Promise<WalletType[]>
	onValueChange: ((value: string) => void) | undefined
	mint?: string
}) {
	const tokens = use(walletPromise)
	const selectedToken = tokens.find(t => t.id === mint)

	return (
		<div className="h-[69px] w-full">
			<div
				className={
					'grid grid-cols-2 items-center w-full gap-2 border rounded-t-lg border-white border-opacity-[0.125] p-3'
				}
			>
				<div className="group relative h-[44px] w-[48px] shrink-0 rounded-lg border border-white/10 transition-all duration-500 ease-in-out">
					<div className="overflow-hidden rounded-lg group-hover:opacity-80">
						{selectedToken && (
							<Image
								fill={true}
								src={selectedToken.image}
								alt={selectedToken.name}
								className="relative aspect-[48/44] object-cover object-center rounded-lg"
							/>
						)}
					</div>
				</div>

				<Select
					className="sm:w-[100%]"
					placeholder="Select a token to airdrop..."
					onValueChange={onValueChange}
					defaultValue={undefined}
				>
					<SelectContent style={{ width: 'calc(var(--radix-select-trigger-width)' }}>
						{[...tokens.map(t => ({ value: t.id, name: t.symbol, tokenAmount: t.tokenAmount }))].map(t => (
							<SelectItem key={t.value} value={t.value}>
								{t.name} {` ${formatCompactNumber(t.tokenAmount.uiAmount)}`}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	)
}

function SelectMintForAirdropFallback() {
	return (
		<div className="h-[69px] w-full">
			<div
				className={
					'grid grid-cols-2 items-center w-full gap-2 border rounded-t-lg border-white border-opacity-[0.125] p-3'
				}
			>
				<div className="group relative h-[44px] w-[48px] shrink-0 rounded-lg border border-white/10 transition-all duration-500 ease-in-out">
					<div className="overflow-hidden rounded-lg group-hover:opacity-80">
						<Loading i={10} className="relative aspect-[48/44] object-cover object-center rounded-lg" />
					</div>
				</div>

				<Loading i={5} className="sm:w-[100%] h-[36px] rounded-lg" />
			</div>
		</div>
	)
}
