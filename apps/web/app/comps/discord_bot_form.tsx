'use client'

import { useActionState } from 'react'
import { useForm, getFormProps, getInputProps, useInputControl } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'

import { DiscordBotSchema } from '@/app/utils/schemas'

import { type State, leaveAComment } from '@/app/actions/discord_bot_action'

import { SubmitButton } from '@/app/comps/submit_button'

const initialState: State = {
	content: undefined,
}

export function DiscordBotForm() {
	const [lastResult, formAction, isPending] = useActionState(leaveAComment, initialState)

	const [form, fields] = useForm({
		// Reuse the validation logic on the client
		onValidate({ formData }) {
			return parseWithZod(formData, {
				// client side validation
				schema: DiscordBotSchema,
			})
		},

		// Validate the form on blur event triggered
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		lastResult,
	})

	let { key, ...rest } = getInputProps(fields.content, { type: 'text' })

	return (
		<div className="self-start relative z-10 flex w-full flex-col divide-zinc-600 bg-background-200 overflow-hidden rounded-xl border border-white border-opacity-[0.05] cursor-default">
			<form
				className="relative rounded-xl transition-colors"
				action={formAction}
				key={form.key}
				{...getFormProps(form)}
			>
				<div className="relative z-10 grid rounded-xl">
					<div className="relative flex rounded-xl">
						<textarea
							className="h-[42px] resize-none overflow-auto w-full flex-1 bg-transparent p-3 pb-1.5 text-base sm:text-sm outline-none ring-0 placeholder:text-text-300 text-text-300"
							placeholder="Leave a comment..."
							onInput={e => {
								const textarea = e.currentTarget
								const value = textarea.value

								// Reset height to recalculate
								textarea.style.height = '42px'
								textarea.style.height = `${textarea.scrollHeight}px`
							}}
							key={key}
							{...rest}
						/>
					</div>
					<div className="flex items-end justify-between gap-2 p-3 cursor-default">
						<span></span>
						<SubmitButton variant="submit_1" isPending={isPending} />
					</div>
				</div>
			</form>
		</div>
	)
}
