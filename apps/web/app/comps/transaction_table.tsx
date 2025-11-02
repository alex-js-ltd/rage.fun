'use client'

import React, { type ReactNode, use, useState } from 'react'
import { type TransactionTableType } from '@/app/utils/schemas'

import { cn, formatNumberSmart } from '@/app/utils/misc'
import { type TokenFeedType } from '@/app/utils/schemas'
import { shortAddress } from '@/app/utils/misc'
import { Icon } from './_icon'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'
import { timeFromNow } from '@/app/utils/misc'
import { formatTinyNumber } from '@/app/utils/misc'

export type TransactionTableProps = {
	transactionPromise: Promise<TransactionTableType[]>
	tokenPromise: Promise<TokenFeedType>
}

export function TransactionTable({ transactionPromise, tokenPromise }: TransactionTableProps) {
	const initial = use(transactionPromise)
	const token = use(tokenPromise)

	const [rows, setRows] = useState<(TransactionTableType & { animate: boolean })[]>(() =>
		initial.map(r => ({ ...r, animate: false })),
	)

	const { channel } = useChannel('transactionEvent', (message: Ably.Message) => {
		const transactionEvent: TransactionTableType = message.data

		if (transactionEvent.tokenId !== token.id) return

		setRows(prev => {
			const newRow = { ...transactionEvent, animate: true }

			return [newRow, ...prev.map(r => ({ ...r, animate: false }))]
		})
	})

	if (rows.length === 0) return null

	return (
		<div className="flex-1 sm:block sm:col-span-2 border-b border-white border-opacity-[0.125] overflow-hidden">
			<div className="max-h-[172px] overflow-y-scroll w-full scrollbar-hide">
				<table className="w-full text-xs caption-bottom sm:table-auto ">
					<thead className="sticky top-0 z-10  whitespace-nowrap after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-white/10 bg-background-100 ">
						<tr className="h-10 shadow-[0_1px_0_0_theme(colors.neutral.900)] transition-colors">
							<th className="px-3 text-left text-text-100 font-medium" style={{ width: 150 }}>
								Date / Age
							</th>
							<th className="px-3 text-center text-text-200 font-medium max-lg:hidden" style={{ width: 50 }}>
								Type
							</th>
							<th className="px-3 text-right text-text-200 font-medium" style={{ width: 150 }}>
								Price
							</th>
							<th className="px-3 text-right text-text-200 font-medium" style={{ width: 150 }}>
								Volume
							</th>
							<th
								className="px-3 text-right text-text-200 font-medium max-w-[100px] truncate whitespace-nowrap overflow-hidden"
								style={{ width: 150 }}
							>
								{token.metadata.symbol}
							</th>
							<th className="px-3 text-right text-text-200 font-medium max-sm:hidden" style={{ width: 150 }}>
								Trader
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.map(r => (
							<TableRow key={r.id} animate={r.animate} row={r} />
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

function TableRow({ row, animate }: { row: TransactionTableType; animate: boolean }) {
	return (
		<tr
			className={cn(
				'h-10 text-text-100',
				row.swapType === 'Buy' && animate && 'animate-buy',
				row.swapType === 'Sell' && animate && 'animate-sell',
			)}
		>
			<td className="px-3 text-left font-medium">
				<div className="flex items-center gap-x-1 truncate">
					<div>{timeFromNow(row.time)}</div>
				</div>
			</td>
			<td className="px-3 text-center capitalize max-lg:hidden">
				<SwapType swapType={row.swapType} />
			</td>
			<td
				className={cn(
					'px-3 text-right font-medium md:text-text-100',
					row.swapType === 'Buy' ? 'text-buy-100' : 'text-sell-100',
				)}
			>{`$${formatTinyNumber(row.price)}`}</td>
			<td className="px-3 text-right font-medium">{`$${formatNumberSmart(row.volume)}`}</td>
			<td className="px-3 text-right font-medium">{row.uiAmount}</td>
			<td className="px-3 max-sm:hidden">
				<div className="flex justify-end items-center gap-x-1.5 text-neutral-400 cursor-pointer">
					<a
						href={`https://solscan.io/tx/${row.id}`}
						target="_blank"
						rel="noopener noreferrer"
						className="truncate max-w-[12ch] font-medium flex items-center gap-2"
					>
						{shortAddress(row.signer)} <Icon name="link" className="size-3" />
					</a>
				</div>
			</td>
		</tr>
	)
}

function SwapType({ swapType }: { swapType: TransactionTableType['swapType'] }) {
	const color = swapType === 'Buy' ? 'text-buy-100' : 'text-sell-100'
	return <div className={cn('inline-flex items-center rounded px-1 py-0.5 text-xs font-medium', color)}>{swapType}</div>
}
