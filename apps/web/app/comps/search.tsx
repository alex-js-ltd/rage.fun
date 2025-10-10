'use client'

import Form from 'next/form'
import { useFormStatus } from 'react-dom'
import { use, useState, useEffect, useRef } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type TokenMetadataType } from '@/app/utils/schemas'
import { PopoverContent, PopoverRoot, PopoverPortal, PopoverTrigger } from '@/app/comps/popover'
import { TokenLogo, getTokenLogoProps } from '@/app/comps/token_logo'
import Link from 'next/link'
import { Icon } from './_icon'
import { cn } from '@/app/utils/misc'
import { useBackpressure } from '@/app/hooks/use_backpressure'

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

export function SearchBase({ initialQuery }: { initialQuery: string }) {
	let pathname = usePathname()
	let [inputValue, setInputValue] = useState(initialQuery)
	let inputRef = useRef<HTMLInputElement>(null)
	let { triggerUpdate, shouldSuspend, formRef } = useBackpressure()

	async function handleSubmit(formData: FormData) {
		let query = formData.get('search') as string
		let newUrl = `${pathname}?search=${encodeURIComponent(query)}`
		await triggerUpdate(newUrl)
	}

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		let newValue = e.target.value
		setInputValue(newValue)
		formRef.current?.requestSubmit()
	}

	useEffect(() => {
		if (inputRef.current && inputValue) {
			inputRef.current.focus()
			inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length)
		}
	}, [inputValue])

	return (
		<Form ref={formRef} action={handleSubmit} className="h-[40px] w-full relative flex items-center">
			<label htmlFor="search" className="sr-only">
				Search
			</label>

			<Icon name="search" className="absolute left-4 size-4 text-text-200" />

			<input
				className={cn(
					'w-full h-full rounded-full border border-white/10 bg-background-100 text-white',
					'placeholder-text-200 focus:border-rage-100 focus:ring-1 focus:ring-rage-100/40',
					'focus:outline-none caret-rage-100 transition-all duration-150 px-10',
					inputValue && 'border-rage-100',
				)}
				placeholder="Search symbol..."
				value={inputValue}
				ref={inputRef}
				onChange={handleInputChange}
				type="text"
				name="search"
				id="search"
			/>
		</Form>
	)
}

export function SearchFallback() {
	return <SearchBase initialQuery="" />
}

export function SearchField() {
	let query = useSearchParams().get('search') ?? ''
	return <SearchBase initialQuery={query} />
}
