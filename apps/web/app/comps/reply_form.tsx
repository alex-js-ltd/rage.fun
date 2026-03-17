'use client'

import { useActionState } from 'react'
import { useForm } from '@conform-to/react/future'
import { ReplySchema } from '@/app/utils/schemas'
import { reply } from '@/app/actions/reply'
import { usePayer } from '@/app/hooks/use_payer'
import { Button } from '@/app/comps/ui/button'
import { UnifiedWalletButton as ConnectWallet } from '@jup-ag/wallet-adapter'

export function ReplyForm({ mint }: { mint: string }) {
	const [lastResult, formAction, isPending] = useActionState(reply, null)

	const { form, fields } = useForm(ReplySchema, {
		lastResult,
		shouldValidate: 'onBlur',
	})

	const publicKey = usePayer()

	return (
		<div className="self-start relative z-10 flex w-full flex-col divide-zinc-600 overflow-hidden  border-b border-white border-opacity-[0.125] cursor-default">
			<form className="relative rounded-xl transition-colors" action={formAction} {...form.props}>
				{/* hidden inputs */}
				<input name="publicKey" type="hidden" defaultValue={publicKey} />

				<input name="mint" type="hidden" defaultValue={mint} />

				<div className="relative z-10 grid rounded-xl">
					<div className="relative flex rounded-xl">
						<textarea
							className="h-[42px] resize-none overflow-auto w-full flex-1 bg-transparent p-4 pb-1.5 text-base sm:text-sm outline-none ring-0 placeholder:text-text-300 text-text-300"
							placeholder="Post your reply"
							onInput={e => {
								const textarea = e.currentTarget
								const value = textarea.value

								// Reset height to recalculate
								textarea.style.height = '42px'
								textarea.style.height = `${textarea.scrollHeight}px`
							}}
							id={fields.content.id}
							name={fields.content.name}
							defaultValue={fields.content.defaultValue}
							aria-invalid={!fields.content.valid || undefined}
							aria-describedby={fields.content.ariaDescribedBy}
						/>
					</div>
					<div className="flex items-end justify-between gap-2 p-4 cursor-default">
						<span></span>

						{publicKey ? (
							<Button
								disabled={isPending}
								type="submit"
								className="bg-background-500 hover:bg-background-600 rounded-full p-4 h-[34px] flex items-center font-semibold"
							>
								Reply
							</Button>
						) : (
							<ConnectWallet
								overrideContent={
									<Button className="bg-background-500 rounded-full h-[34px] flex items-center font-semibold text-black text-sm px-4">
										Connect
									</Button>
								}
								currentUserClassName="button"
							/>
						)}
					</div>
				</div>
			</form>
		</div>
	)
}
