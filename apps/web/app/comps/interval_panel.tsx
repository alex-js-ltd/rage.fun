'use client'
import { useCallback } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { useChangeSearchParams } from '@/app/hooks/use_change_search_params'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const seconds = ['1s', '15s', '30s'] as const

const minutes = ['1m', '5m', '15m', '30m'] as const

const hours = ['1h', '4h', '6h', '12h', '24h'] as const

export function IntervalPanel() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	// Get a new searchParams string by merging the current
	// searchParams with a provided key/value pair
	const createQueryString = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString())
			params.set(name, value)

			return params.toString()
		},
		[searchParams],
	)

	const interval = searchParams.get('interval') || ''

	return (
		<SelectPrimitive.Root
			value={interval}
			onValueChange={value => {
				router.replace(pathname + '?' + createQueryString('interval', value), { scroll: false })
			}}
		>
			<SelectPrimitive.Trigger className="text-text-100 text-xs flex items-center gap-2 h-full px-3 focus:outline-none">
				<SelectPrimitive.Value placeholder={interval} />
				<SelectPrimitive.Icon className="text-violet11 ml-auto">
					<ChevronDownIcon />
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>

			<SelectPrimitive.Portal>
				<SelectPrimitive.Content
					position="popper"
					side="bottom"
					align="start"
					sideOffset={1}
					className="relative w-[--radix-select-trigger-width] min-w-[--radix-select-trigger-width] overflow-hidden bg-background-100  z-10  h-auto data-[state=open]:animate-scale-in-95 data-[state=closed]:animate-scale-out-50 "
				>
					<SelectPrimitive.Viewport>
						<SelectPrimitive.Group>
							<SelectPrimitive.Label className="mx-auto text-xs leading-[25px] text-text-200 w-fit"></SelectPrimitive.Label>
							<SelectPrimitive.Separator />
							{seconds.map(interval => (
								<SelectPrimitive.Item
									className="w-full h-[52px] flex items-center justify-center hover:bg-white/10 select-none outline-none data-[state=checked]:text-text-100 data-[state=unchecked]:text-text-200 text-xs cursor-pointer"
									key={interval}
									value={interval}
								>
									<SelectPrimitive.ItemText>{interval}</SelectPrimitive.ItemText>
								</SelectPrimitive.Item>
							))}
						</SelectPrimitive.Group>

						<SelectPrimitive.Group>
							<SelectPrimitive.Separator className="w-full h-[1px] bg-white/10" />

							{minutes.map(interval => (
								<SelectPrimitive.Item
									className="w-full h-[52px] flex items-center justify-center hover:bg-white/10 select-none outline-none data-[state=checked]:text-text-100 data-[state=unchecked]:text-text-200 text-xs cursor-pointer"
									key={interval}
									value={interval}
								>
									<SelectPrimitive.ItemText>{interval}</SelectPrimitive.ItemText>
								</SelectPrimitive.Item>
							))}
						</SelectPrimitive.Group>

						<SelectPrimitive.Group>
							<SelectPrimitive.Separator className="w-full h-[1px] bg-white/10" />

							{hours.map(interval => (
								<SelectPrimitive.Item
									className="w-full h-[52px] flex items-center justify-center hover:bg-white/10 select-none outline-none data-[state=checked]:text-text-100 data-[state=unchecked]:text-text-200 text-xs cursor-pointer"
									key={interval}
									value={interval}
								>
									<SelectPrimitive.ItemText>{interval}</SelectPrimitive.ItemText>
								</SelectPrimitive.Item>
							))}
						</SelectPrimitive.Group>
					</SelectPrimitive.Viewport>
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	)
}
