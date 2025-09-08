'use client'

import { use } from 'react'

export function PriceDeltas({
	priceDeltaPromise,
}: {
	priceDeltaPromise: Promise<{
		'5m': number
		'1h': number
		'6h': number
		'24h': number
	}>
}) {
	const object = use(priceDeltaPromise)
	return (
		<div className="flex gap-2 justify-between py-10">
			{Object.entries(object).map(([k, v]) => (
				<div
					key={k}
					className="flex flex-col gap-2 items-center justify-center flex-1 border-r border-white border-opacity-[0.125] last:border-r-0"
				>
					<span className="text-xs text-text-200">{k}</span>
					<span className="text-xs text-text-200">{`${v}%`}</span>
				</div>
			))}
		</div>
	)
}
