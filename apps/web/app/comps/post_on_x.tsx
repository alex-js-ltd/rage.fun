import { type ButtonProps, Button } from './button'
import { Icon } from './_icon'
import { cn } from '@/app/utils/misc'

function generateSolanaBlink(mint: string): string {
	const apiUrl = `https://www.magicmint.fun/api/buy?mint=${encodeURIComponent(mint)}`
	return `https://dial.to/?action=${encodeURIComponent(`solana-action:${apiUrl}`)}`
}

export interface AnchorProps extends React.ComponentProps<'a'> {}

function getAnchorProps(mint: string): AnchorProps {
	const text = generateSolanaBlink(mint)
	return {
		href: `https://x.com/intent/post?text=${encodeURIComponent(text)}`,
		target: '_blank',
		rel: 'noopener noreferrer',
		className: 'twitter-share-button',
	}
}

type PostOnXProps = ButtonProps & { mint: string }

export function PostOnX({ mint, className, ...props }: PostOnXProps) {
	return (
		<Button
			asChild
			className={cn(
				'w-[73px] h-[28px] text-[13px] leading-[26px] bg-black text-sm text-white rounded-full flex align-middle items-center justify-center',
				className,
			)}
			{...props}
		>
			<a {...getAnchorProps(mint)}>
				<Icon name="post-on-x" className="w-[18px] h-[18px]" />

				<span className="ml-[4px]">Post</span>
			</a>
		</Button>
	)
}
