import { useState } from 'react'
import { Icon } from '@/app/comps/ui/_icon'
import { buyBlink } from '@/app/utils/dialect'
import { useCopyToClipboard } from 'usehooks-ts'

export function Blink({ mint }: { mint: string }) {
	const [copied, setCopied] = useState(false)
	const [_, copy] = useCopyToClipboard()

	function handleClick() {
		copy(buyBlink(mint))

		setCopied(true)

		setTimeout(() => {
			setCopied(false)
		}, 1500)
	}

	return (
		<button
			onClick={handleClick}
			className="w-fit min-w-[120px] h-7 rounded-full flex items-center justify-center px-4 gap-1.5 border border-white/5"
		>
			<Icon name="dialect" className="w-[15px] h-[14px] text-white" />
			<span className="text-xs font-medium text-text-200 whitespace-nowrap">{copied ? 'Copied' : 'Share Blink'}</span>
		</button>
	)
}
