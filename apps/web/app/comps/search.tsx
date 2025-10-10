'use client'

import { use, useState, useEffect } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type TokenMetadataType } from '@/app/utils/schemas'
import { PopoverContent, PopoverRoot, PopoverPortal, PopoverTrigger } from '@/app/comps/popover'
import { TokenLogo, getTokenLogoProps } from '@/app/comps/token_logo'
import Link from 'next/link'
import { Icon } from './_icon'
import { cn } from '@/app/utils/misc'

export function SearchField() {
	const searchParams = useSearchParams()
	const { replace } = useRouter()
	const pathname = usePathname()

	const handleSearch = useDebounceCallback((term: string) => {
		console.log(`Searching... ${term}`)

		const params = new URLSearchParams(searchParams)

		if (term) {
			params.set('query', term)
		} else {
			params.delete('query')
		}
		replace(`${pathname}?${params.toString()}`, { scroll: false })
	}, 300)

	const query = searchParams.get('query')

	return (
		<div className="h-[40px] w-full relative flex items-center">
			<Icon name="search" className="absolute left-4 size-4 text-text-200" />

			<input
				className={cn(
					'w-full h-full rounded-full border border-white/10 bg-background-100 text-white',
					'placeholder-text-200 focus:border-rage-100 focus:ring-1 focus:ring-rage-100/40',
					'focus:outline-none caret-rage-100 transition-all duration-150 px-10',
					query && 'border-rage-100',
				)}
				placeholder="Search symbol..."
				onChange={e => handleSearch(e.target.value)}
				defaultValue={query?.toString()}
			/>
		</div>
	)
}

export function SearchResults({ searchPromise }: { searchPromise: Promise<TokenMetadataType[]> }) {
	const tokens = use(searchPromise)

	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (tokens.length > 0) {
			setOpen(true)
		} else {
			setOpen(false)
		}
	}, [tokens])

	return (
		<PopoverRoot open={open} onOpenChange={setOpen}>
			<PopoverTrigger>
				<div className="z-50 w-full"></div>
			</PopoverTrigger>
			<PopoverPortal>
				<PopoverContent
					className="w-[--radix-popover-trigger-width] z-50 p-0 rounded-md border border-white/10 shadow-lg outline-none bg-background-100"
					side="bottom"
					align="start"
					sideOffset={0}
				>
					{/* <-- make *this* the scroll container */}
					<div className="w-full max-h-[50vh] overflow-y-auto overscroll-contain">
						<ul className="">
							{tokens.map(token => (
								<li key={token.tokenId} className="text-text-100 hover:bg-white/5 transition-colors p-3">
									<Link
										className="flex items-center gap-2"
										href={{
											pathname: `/token/${token.tokenId}`,
											query: { interval: '5m' },
										}}
										as={`/token/${token.tokenId}?interval=5m`}
									>
										<TokenLogo {...getTokenLogoProps(token)} className="w-[40px] h-[40px] rounded-full" />
										<span className="text-text-200 uppercase  text-xs text-nowrap">{token.symbol}</span>
									</Link>
								</li>
							))}
						</ul>
					</div>
				</PopoverContent>
			</PopoverPortal>
		</PopoverRoot>
	)
}
