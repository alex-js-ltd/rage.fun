'use client'

import { Button, type ButtonProps } from '@/app/comps/button'
import { Icon } from '@/app/comps/_icon'
import { Spinner } from '@/app/comps/spinner'
import { useAnchorWallet } from '@jup-ag/wallet-adapter'
import { type TooltipContentProps, Tooltip, TooltipContent, TooltipTrigger } from '@/app/comps/tooltip'

import { cn } from '@/app/utils/misc'

export type SubmitButtonProps = {
	variant: Extract<ButtonProps['variant'], 'submit_1' | 'submit_2' | 'submit_3'>

	content?: string
	isPending: boolean
	isLoading?: boolean
	onClick?: ButtonProps['onClick']
}

export function SubmitButton({ content, variant, isPending, isLoading, onClick }: SubmitButtonProps) {
	const wallet = useAnchorWallet()
	const { publicKey } = wallet || {}

	const disabled = !publicKey || isPending || isLoading ? true : false

	return (
		<Tooltip open={publicKey ? undefined : false}>
			<TooltipContent
				variant={variant}
				sideOffset={18}
				align="end"
				alignOffset={-12}
				side="bottom"
				className={content ? 'flex' : 'hidden'}
			>
				{content}
			</TooltipContent>

			<TooltipTrigger asChild>
				<Button
					type="submit"
					disabled={disabled}
					variant={variant}
					aria-label={`Submit ${content}`}
					onClick={onClick}
					onPointerDown={e => {
						e.stopPropagation()
						e.preventDefault()
						e.currentTarget.form?.requestSubmit()
					}}
				>
					{isPending ? <Spinner /> : <Icon name="submit" className="size-4" />}
				</Button>
			</TooltipTrigger>
		</Tooltip>
	)
}
