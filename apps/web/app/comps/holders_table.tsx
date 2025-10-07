'use client'

import React, { use, useState } from 'react'
import { type TopHolderType } from '@/app/utils/schemas'
import { shortAddress } from '@/app/utils/misc'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'
import { useParams } from 'next/navigation'

export type HoldersTableProps = {
	holdersPromise: Promise<TopHolderType[]>
}

export function HoldersTable({ holdersPromise }: HoldersTableProps) {
	const initial = use(holdersPromise)

	const [holdersData, setHoldersData] = useState<TopHolderType[]>(initial)

	const { id } = useParams()

	const { channel } = useChannel('holdersEvent', (message: Ably.Message) => {
		const holdersEvent: { holders: TopHolderType[]; id: string } = message.data

		if (holdersEvent.id !== id) return

		setHoldersData(holdersEvent.holders)
	})

	if (holdersData.length === 0) return null

	return (
		<div className="flex-1 sm:block sm:col-span-2 max-h-[172px] overflow-hidden  border-y border-white border-opacity-[0.125] ">
			<div className="max-h-[172px] overflow-y-scroll w-full scrollbar-hide">
				<table className="w-full text-xs caption-bottom sm:table-auto ">
					<thead className="sticky top-0 z-10 whitespace-nowrap  after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-white/10 bg-background-100">
						<tr className="h-10 shadow-[0_1px_0_0_theme(colors.neutral.900)] transition-colors">
							<th className="px-3 text-left text-text-100 font-medium" style={{ width: 150 }}>
								Account
							</th>
							<th className="px-3 text-right text-text-200 font-medium" style={{ width: 50 }}>
								% Owned
							</th>
							<th className="px-3 text-right text-text-200 font-medium" style={{ width: 150 }}>
								Amount
							</th>
						</tr>
					</thead>
					<tbody>
						{holdersData.map((row, i) => (
							<tr key={row.owner} className="h-10 text-text-100">
								<td className="px-3 text-left font-medium">
									<div className="flex items-center gap-x-1 truncate">
										<a href={`https://solscan.io/account/${row.address}`}>
											<span className="text-text-200">{`#${i + 1} `}</span>
											<span>{shortAddress(row.owner)}</span>
										</a>

										{row.isCreator && (
											<span
												className={`ml-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded tracking-wide bg-purple-500/20 text-purple-300`}
											>
												Creator
											</span>
										)}
									</div>
								</td>

								<td className="px-3 text-right font-medium">{row.percentageOwned}</td>
								<td className="px-3 text-right font-medium">{row.uiAmount}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
