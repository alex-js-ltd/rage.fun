import React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

interface RootProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {}

interface ListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {}

interface TriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {}

interface ContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {}

function Tabs(props: RootProps) {
	return <TabsPrimitive.Root defaultValue="tab1" {...props} />
}

function List(props: ListProps) {
	return <TabsPrimitive.List className="flex items-center gap-2" {...props} />
}

function Trigger(props: TriggerProps) {
	return <TabsPrimitive.Trigger className="flex gap-2" {...props} />
}

function Content({ children, ...props }: ContentProps) {
	return <TabsPrimitive.Content {...props}>{children}</TabsPrimitive.Content>
}

export { Tabs, List, Trigger, Content }
