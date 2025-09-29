'use client'

import { use, useState, useEffect } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type TokenMetadataType } from '@/app/utils/schemas'
import { PopoverContent, PopoverRoot, PopoverPortal, PopoverTrigger } from '@/app/comps/popover'
import { TokenLogo, getTokenLogoProps } from '@/app/comps/token_logo'
import Link from 'next/link'
import { Icon } from './_icon'

export function SearchField({}) {
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

	return (
		<div className="h-[40px] w-full relative flex items-center justify-between border border-white rounded-full border-opacity-[0.125] px-3">
			<Icon name="search" className="size-4 text-text-100" />
			<input
				className="h-full resize-none overflow-auto w-full flex-1 bg-transparent text-sm outline-none ring-0 placeholder:text-text-300 text-text-300 items-center px-2"
				placeholder="Search symbol..."
				onChange={e => {
					handleSearch(e.target.value)
				}}
				defaultValue={searchParams.get('query')?.toString()}
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
					className="w-[--radix-popover-trigger-width] z-50 p-0 rounded-md border border-white/10 shadow-lg outline-none"
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
											query: { interval: '300000' },
										}}
										as={`/token/${token.tokenId}?interval=300000`}
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
