import React, { ReactNode } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'

type CheckboxProps = {
	icons: { checked: ReactNode; unchecked: ReactNode }
	onCheckedChange: CheckboxPrimitive.CheckboxProps['onCheckedChange']
	checked: CheckboxPrimitive.CheckedState
}

export function Checkbox({ onCheckedChange, checked, icons }: CheckboxProps) {
	return (
		<CheckboxPrimitive.Root
			className="shrink-0 relative w-[36px] h-[36px] flex justify-center items center text-text-100 bg-background-400 rounded-md hover:bg-background-300 border border-background-400"
			defaultChecked={true}
			checked={checked}
			onCheckedChange={checked => {
				if (typeof onCheckedChange === 'function') onCheckedChange(checked)
			}}
		>
			{checked ? null : icons.unchecked}
			<CheckboxPrimitive.Indicator className="absolute inset-0 w-full h-full flex justify-center items center ">
				{icons.checked}
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	)
}
