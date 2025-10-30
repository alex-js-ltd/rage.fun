import { Icon } from './_icon'
import { buyBlink } from '@/app/utils/dialect'
import { useCopyToClipboard } from 'usehooks-ts'
import { useAsync } from '@/app/hooks/use_async'
import { delay } from '@/app/utils/misc'

export function Blink({ mint }: { mint: string }) {
	const [_, copy] = useCopyToClipboard()
	const { run, data, reset } = useAsync()

	async function handleClick() {
		const blink = buyBlink(mint)

		await copy(blink)
		run(Promise.resolve('copied')) // explicitly set state
		await delay(1000)
		reset()
	}

	return (
		<button
			onClick={handleClick}
			className="h-7 rounded-full flex items-center justify-center px-4 gap-1.5 border border-white border-opacity-[0.05]"
		>
			<Icon name="dialect" className="w-[15px] h-[14px] text-white" />
			<span className="text-xs font-medium text-text-200">{data ? 'Copied' : 'Share Blink'}</span>
		</button>
	)
}
