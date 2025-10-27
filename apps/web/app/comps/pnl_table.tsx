'use client'

import React, { use, useState } from 'react'
import { type PnlType } from '@/app/utils/schemas'
import { shortAddress } from '@/app/utils/misc'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'
import { useParams } from 'next/navigation'
import { formatNumberSmart } from '@/app/utils/misc'
import { cn } from '@/app/utils/misc'

export type PnLTableProps = {
	pnlPromise: Promise<PnlType[]>
}

export function PnLTable({ pnlPromise }: PnLTableProps) {
	const initial = use(pnlPromise)

	const [state, setState] = useState<PnlType[]>(initial)

	const { mint } = useParams()

	if (state.length === 0) return null

	return (
		<div className="flex-1 sm:block sm:col-span-2 max-h-[172px] overflow-hidden  border-y border-white border-opacity-[0.125] ">
			<div className="max-h-[172px] overflow-y-scroll w-full scrollbar-hide">
				<table className="w-full text-xs caption-bottom sm:table-auto ">
					<thead className="sticky top-0 z-10 whitespace-nowrap  after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-white/10 bg-background-100">
						<tr className="h-10 shadow-[0_1px_0_0_theme(colors.neutral.900)] transition-colors">
							<th className="px-3 text-left text-text-100 font-medium" style={{ width: 150 }}>
								Wallet
							</th>
							<th className="px-3 text-right text-text-200 font-medium" style={{ width: 50 }}>
								Bought
							</th>
							<th className="px-3 text-right text-text-200 font-medium" style={{ width: 150 }}>
								Sold
							</th>

							<th className="px-3 text-right text-text-200 font-medium" style={{ width: 150 }}>
								R. PnL
							</th>
						</tr>
					</thead>
					<tbody>
						{state.map((row, i) => (
							<tr key={`${row.signer}`} className="h-10 text-text-100">
								<td className="px-3 text-left font-medium">
									<div className="flex items-center gap-x-1 truncate">
										<a href={`https://solscan.io/account/${row.signer}`}>
											<span className="text-text-200">{`#${i + 1} `}</span>
											<span>{shortAddress(row.signer)}</span>
										</a>
									</div>
								</td>

								<td className="px-3 text-right font-medium text-buy-100">{`$${formatNumberSmart(row.bought)}`}</td>
								<td
									className={cn('px-3 text-right font-mediumm ', row.sold === 0 ? 'text-text-100' : 'text-sell-100')}
								>{`$${formatNumberSmart(row.sold)}`}</td>

								<td
									className={cn(
										'px-3 text-right font-mediumm ',
										row.bought > row.sold ? 'text-sell-100' : 'text-buy-100',
									)}
								>{`$${formatNumberSmart(row.realizedPnl)}`}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
