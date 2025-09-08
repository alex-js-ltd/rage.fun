'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'

import { cn } from '@/app/utils/misc'

const Accordion = AccordionPrimitive.Root

function AccordionItem({ className, ref, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
	return <AccordionPrimitive.Item ref={ref} className={className} {...props} />
}

AccordionItem.displayName = 'AccordionItem'

const AccordionHeader = AccordionPrimitive.AccordionHeader

function AccordionTrigger({
	className,
	children,
	ref,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
	return (
		<AccordionPrimitive.Trigger ref={ref} className={className} {...props}>
			{children}
		</AccordionPrimitive.Trigger>
	)
}

AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

function AccordionContent({
	className,
	children,
	ref,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
	return (
		<AccordionPrimitive.Content
			ref={ref}
			className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
			{...props}
		>
			<div className={className}>{children}</div>
		</AccordionPrimitive.Content>
	)
}

export { Accordion, AccordionHeader, AccordionItem, AccordionTrigger, AccordionContent }
