'use client'

import { type RefAttributes, type CSSProperties, ReactNode } from 'react'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import * as RadixSelect from '@radix-ui/react-select'
import { cn } from '../utils/misc'

type SelectProps = {
	onValueChange: RadixSelect.SelectProps['onValueChange']
	defaultValue: RadixSelect.SelectProps['defaultValue']

	placeholder?: string
	className?: string
	children: ReactNode
}

export function Select({ onValueChange, defaultValue, placeholder = '', className, children }: SelectProps) {
	return (
		<RadixSelect.Root onValueChange={onValueChange} defaultValue={defaultValue}>
			<RadixSelect.Trigger
				className={cn(
					'inline-flex h-[36px]  w-full sm:w-24 flex-1  items-center gap-1.5 rounded-md bg-background-400 border-background-400 text-text-100 hover:bg-background-300 text-sm px-2 transition-colors whitespace-nowrap focus:outline-none border font-medium',
					className,
				)}
			>
				<RadixSelect.Value placeholder={placeholder} />

				<RadixSelect.Icon className="text-violet11 ml-auto">
					<ChevronDownIcon />
				</RadixSelect.Icon>
			</RadixSelect.Trigger>

			<RadixSelect.Portal>{children}</RadixSelect.Portal>
		</RadixSelect.Root>
	)
}

type SelectContentProps = RadixSelect.SelectContentProps & RefAttributes<HTMLDivElement>

export function SelectContent({ ref, ...props }: SelectContentProps) {
	return (
		<RadixSelect.Content
			style={{
				width: 'calc(var(--radix-select-trigger-width) + 8px + 36px + 8px + 36px)', // Extend width dynamically
			}}
			position="popper"
			side="bottom"
			align="start"
			sideOffset={8}
			className="relative overflow-hidden bg-background-100 rounded-lg z-10  h-auto max-h-[136px] data-[state=open]:animate-scale-in-95 data-[state=closed]:animate-scale-out-50"
			{...props}
			ref={ref}
		>
			<RadixSelect.Viewport className="p-1">
				<RadixSelect.Group>{props.children}</RadixSelect.Group>
			</RadixSelect.Viewport>
		</RadixSelect.Content>
	)
}

type SelectItemProps = RadixSelect.SelectItemProps & RefAttributes<HTMLDivElement>

export function SelectItem({ children, className, ref, ...props }: SelectItemProps) {
	return (
		<RadixSelect.Item
			className="data-[state=checked]:bg-background-100 relative select-none outline-none group w-full cursor-pointer items-center gap-1.5 rounded p-1 pl-2 text-sm text-text-100 bg-background-100  font-medium flex justify-between"
			{...props}
			ref={ref}
		>
			<RadixSelect.ItemText className="cursor-pointer">{children}</RadixSelect.ItemText>
			<span className="relative flex size-4 shrink-0 items-center justify-center rounded-full border border-gray-500 group cursor-pointer">
				<RadixSelect.ItemIndicator className="inline-flex w-full h-full items-center justify-center">
					<div className="size-2 rounded-full bg-text-100 transition-all opacity-100" />
				</RadixSelect.ItemIndicator>

				<div className="absolute z-50 size-2 rounded-full bg-text-100 transition-all opacity-0 group-hover:opacity-30" />
			</span>
		</RadixSelect.Item>
	)
}
