import { type ReactNode } from 'react'

interface LayoutProps {
	children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
	return (
		<main className="flex-1 min-h-screen pb-4 sm:min-h-[calc(100vh-64px)]">
			<div className="mx-auto flex max-w-5xl flex-col px-6">
				<section className="grid grid-cols-1 relative gap-4">{children}</section>
			</div>
		</main>
	)
}

export const dynamic = 'force-dynamic'
