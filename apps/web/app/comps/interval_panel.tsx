'use client'

import { NavLink } from '@/app/comps/nav_link'
import { Button } from '@/app/comps/button'
import { Icon } from '@/app/comps/_icon'

export enum Interval {
	'5m' = 5 * 60_000, // 5 minutes in milliseconds
	'1h' = 60 * 60_000, // 1 hour in milliseconds
	'6h' = 6 * 60 * 60_000, // 6 hours in milliseconds
	'24h' = 24 * 60 * 60_000, // 24 hours in milliseconds
}

export function IntervalPanel({ mint }: { mint: string }) {
	const start: Array<[string, number]> = []

	const intervals = Object.entries(Interval).reduce((acc, curr) => {
		const [key, value] = curr

		if (typeof value === 'number') {
			acc.push([key, value])
		}

		return acc
	}, start)

	return (
		<div className="flex gap-2 justify-end z-50">
			{intervals.map(([label, value]) => (
				<NavLink replace key={label} href={`/token/${mint}?interval=${value}`}>
					{({ isActive }) => (
						<Button variant="interval" className={isActive ? 'bg-white/10' : undefined}>
							{label}

							<Icon name="interval" className="size-4" />
						</Button>
					)}
				</NavLink>
			))}
		</div>
	)
}
