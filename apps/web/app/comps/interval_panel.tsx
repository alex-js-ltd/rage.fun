'use client'

import { NavLink } from '@/app/comps/nav_link'
import { Button } from '@/app/comps/button'
import { Icon } from '@/app/comps/_icon'

const intervals = ['5m', '1h', '6h', '24h']

export function IntervalPanel({ mint }: { mint: string }) {
	return (
		<div className="flex gap-2 justify-end z-40">
			{intervals.map(interval => (
				<NavLink replace key={interval} href={`/token/${mint}?interval=${interval}`}>
					{({ isActive }) => (
						<Button variant="interval" className={isActive ? 'bg-white/10' : undefined}>
							{interval}

							<Icon name="interval" className="size-4" />
						</Button>
					)}
				</NavLink>
			))}
		</div>
	)
}
