import { use } from 'react'
import { AirdropEvent, TokenMetadata } from '@prisma/client'
import { fromLamports } from '@repo/magicmint'
import { BN } from '@coral-xyz/anchor'
import { TokenLogo } from '@/app/comps/token_logo'

import { Table, TableBody, TableHead, TableHeaderCellElement, TableRow } from '@/app/comps/table'
import { formatTokenAmount } from '../utils/misc'

interface AirdropGridProps {
	airdropPromise: Promise<AirdropEvent[]>
	token: TokenMetadata
	decimals: number
}

export function AirdropGrid({ airdropPromise, token, decimals }: AirdropGridProps) {
	const airdropEvents = use(airdropPromise)

	if (airdropEvents.length === 0) return null

	return (
		<div className="w-full grid grid-cols-1 gap-3 rounded-xl border border-white border-opacity-[0.125]">
			<Table className="table-auto  ">
				<TableHead className="border-b border-white border-opacity-[0.125] ">
					<TableRow className="grid grid-cols-[1fr_auto]">
						<TableHeaderCellElement scope="col" className="text-left text-text-200 text-sm px-3 py-2">
							User
						</TableHeaderCellElement>

						<TableHeaderCellElement scope="col" className="text-left text-text-200 text-sm px-3 py-2">
							<span className="flex gap-2 items-center text-xs">
								<TokenLogo src={token.image} alt={token.name} /> {token.symbol}
							</span>
						</TableHeaderCellElement>
					</TableRow>
				</TableHead>

				<TableBody>
					{airdropEvents.map(e => (
						<tr
							key={e.id}
							className="grid grid-cols-[1fr_auto] border-b border-white border-opacity-[0.05] last:border-b-0"
						>
							<th
								colSpan={1}
								scope="row"
								className="truncate overflow-hidden text-ellipsis whitespace-nowrap text-text-200 text-left text-sm px-3 py-2 font-normal"
							>
								{e.user}
							</th>
							<td colSpan={1} className="text-left text-text-200 text-sm px-3 py-2">
								{formatTokenAmount(fromLamports(new BN(e.amount.toString()), decimals).toString())}
							</td>
						</tr>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
