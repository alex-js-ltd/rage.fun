'use client'

import { NavLink } from '@/app/comps/nav_link'
import { Button } from '@/app/comps/button'
import { Icon } from '@/app/comps/_icon'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { useChangeSearchParams } from '@/app/hooks/use_change_search_params'

const intervals = ['5m', '1h', '6h', '24h']

export function IntervalPanel({ mint, interval }: { mint: string; interval: string }) {
	const { createQueryString } = useChangeSearchParams('interval')
	return (
		<>
			<SelectPrimitive.Root
				value={interval.toString()}
				onValueChange={value => {
					createQueryString(value)
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
						className="relative   w-[--radix-select-trigger-width] 
        min-w-[--radix-select-trigger-width] overflow-hidden bg-background-100  z-10  h-auto data-[state=open]:animate-scale-in-95 data-[state=closed]:animate-scale-out-50"
					>
						<SelectPrimitive.Viewport>
							{intervals.map(interval => (
								<SelectPrimitive.Item
									className="w-full h-[52px] flex items-center justify-center hover:bg-white/10 select-none outline-none data-[state=checked]:text-text-100 data-[state=unchecked]:text-text-200 text-xs cursor-pointer"
									key={interval}
									value={interval}
								>
									<SelectPrimitive.ItemText>{interval}</SelectPrimitive.ItemText>
								</SelectPrimitive.Item>
							))}
						</SelectPrimitive.Viewport>
					</SelectPrimitive.Content>
				</SelectPrimitive.Portal>
			</SelectPrimitive.Root>
		</>
	)
}
