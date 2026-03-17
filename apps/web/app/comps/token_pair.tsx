import { use } from 'react'
import { TokenLogo, getTokenLogoProps, solLogoProps } from '@/app/comps/token_logo'
import { cn } from '@/app/utils/misc'
import { Loading } from '@/app/comps/ui/loading'
import { type TokenMetadata } from '@/app/data/get_token_metadata'

export interface TokenPairProps extends React.ComponentProps<'div'> {
	metadataPromise: Promise<TokenMetadata>
}

export function TokenPair({ metadataPromise, className, ...props }: TokenPairProps) {
	const metadata = use(metadataPromise)

	return (
		<div className={cn('flex items-center ', className)} {...props}>
			<TokenLogo {...getTokenLogoProps(metadata)} />
			<TokenLogo className="-translate-x-2" {...solLogoProps} />

			<span className="text-text-200 uppercase text-xs text-nowrap">
				{metadata.symbol}
				<span className="hidden sm:inline"> / SOL</span>
			</span>
		</div>
	)
}

export function TokenPairFallback(props: React.ComponentProps<'div'>) {
	const { className, ...rest } = props
	return (
		<div className={cn('flex items-center ', className)} {...rest}>
			<Loading i={0} className="shrink-0  h-5 w-5  rounded-full" />
			<Loading i={1} className="shrink-0  h-5 w-5  rounded-full -translate-x-2" />
		</div>
	)
}
