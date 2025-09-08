import { use } from 'react'
import { TokenLogo, getTokenLogoProps, solLogoProps } from '@/app/comps/token_logo'
import { cn } from '@/app/utils/misc'
import { type TokenWithRelationsType } from '@/app/utils/schemas'
import { Loading } from './loading'

export interface TokenPairProps extends React.ComponentProps<'div'> {
	tokenPromise: Promise<TokenWithRelationsType>
}

export function TokenPair({ tokenPromise, className, ...props }: TokenPairProps) {
	const token = use(tokenPromise)

	return (
		<div className={cn('flex items-center ', className)} {...props}>
			<TokenLogo {...getTokenLogoProps(token)} />
			<TokenLogo className="-translate-x-2" {...solLogoProps} />

			<span className="text-text-200 uppercase  text-xs text-nowrap">{token.symbol} / SOL</span>
		</div>
	)
}

export function TokenPairFallback(props: React.ComponentProps<'div'>) {
	const { className, ...rest } = props
	return (
		<div className={cn('flex items-center ', props.className)} {...rest}>
			<Loading i={0} className="shrink-0  h-5 w-5  rounded-full" />
			<Loading i={1} className="shrink-0  h-5 w-5  rounded-full -translate-x-2" />
		</div>
	)
}
