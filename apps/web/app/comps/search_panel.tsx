'use client'

import Form from 'next/form'

import { use, useState, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import { type SearchResult } from '@/app/data/get_search_results'
import { PopoverContent, PopoverRoot, PopoverPortal, PopoverTrigger } from '@/app/comps/ui/popover'
import { TokenLogo, getTokenLogoProps } from '@/app/comps/token_logo'
import { Icon } from '@/app/comps/ui/_icon'
import { cn } from '@/app/utils/misc'
import { useBackpressure } from '@/app/hooks/use_back_pressure'

export function SearchResults({ searchPromise }: { searchPromise: Promise<SearchResult[]> }) {
	const tokens = use(searchPromise)

	const [open, setOpen] = useState(false)

	const pathname = usePathname()

	useEffect(() => {
		if (tokens.length > 0) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setOpen(true)
		} else {
			setOpen(false)
		}
	}, [tokens])

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setOpen(false)
	}, [pathname])

	return (
		<PopoverRoot open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild className="z-50 w-full">
				<div className="z-50 w-full"></div>
			</PopoverTrigger>

			<PopoverPortal>
				<PopoverContent
					className="w-[var(--radix-popover-trigger-width)] z-50 rounded-md border border-white/10 bg-background-100 p-0 shadow-lg outline-none"
					side="bottom"
					align="start"
					sideOffset={0}
				>
					<div className="max-h-[50vh] w-full overflow-y-auto overscroll-contain">
						<ul className="w-full">
							{tokens.map(token => (
								<li key={token.id} className="p-3 text-text-100 transition-colors hover:bg-white/5">
									<Link
										className="flex items-center gap-2"
										href={{
											pathname: `/token/${token.id}`,
											query: { interval: '1m' },
										}}
										as={`/token/${token.id}?interval=1m`}
									>
										<TokenLogo {...getTokenLogoProps(token.metadata)} className="h-10 w-10 rounded-full" />

										<span className="text-nowrap text-xs uppercase text-text-200">{token.metadata.symbol}</span>
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

export function SearchBase() {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const initialQuery = searchParams.get('search') ?? ''
	const [inputValue, setInputValue] = useState(initialQuery)
	const inputRef = useRef<HTMLInputElement>(null)
	const { triggerUpdate, formRef } = useBackpressure()

	async function handleSubmit(formData: FormData) {
		const query = (formData.get('search') as string) ?? ''

		const next = new URLSearchParams(searchParams.toString())

		if (query.trim()) next.set('search', query.trim())
		else next.delete('search')

		const newUrl = `${pathname}?${next.toString()}`
		await triggerUpdate(newUrl)
	}

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const newValue = e.target.value
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
		<Form ref={formRef} action={handleSubmit} className="relative flex h-10 w-full items-center">
			<label htmlFor="search" className="sr-only">
				Search
			</label>

			<Icon name="search" className="absolute left-4 size-4 text-text-200" />

			<input
				className={cn(
					'h-full w-full rounded-full border border-white/10 bg-background-100 text-white',
					'placeholder-text-200 focus:border-rage-100 focus:ring-1 focus:ring-rage-100/40',
					'caret-rage-100 px-10 transition-all duration-150 focus:outline-none',
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
	return <SearchBase />
}

export function SearchField() {
	return <SearchBase />
}
