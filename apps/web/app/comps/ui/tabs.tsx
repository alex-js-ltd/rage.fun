import React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

function Tabs(props: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>) {
	return <TabsPrimitive.Root defaultValue="tab1" {...props} />
}

function List(props: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
	return <TabsPrimitive.List className="flex items-center gap-2" {...props} />
}

function Trigger(props: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
	return <TabsPrimitive.Trigger className="flex gap-2" {...props} />
}

function Content({ children, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
	return <TabsPrimitive.Content {...props}>{children}</TabsPrimitive.Content>
}

export { Tabs, List, Trigger, Content }
