import { prisma, selectTokenPnl as select } from '@repo/database'
import type { TokenPnlRow } from '@repo/database'
import { getSolPrice } from '@/app/data/get_sol_price'
import Decimal from 'decimal.js'
import { solToUsd } from '@/app/utils/misc'
import 'server-only'

export async function getTokenPnl(mint: string) {
	const data = await prisma.tokenPnl.findMany({
		where: {
			tokenId: mint,

			sold: {
				gt: 0, // only include wallets that sold something
			},
		},
		select,

		orderBy: {
			realizedPnl: 'desc', // 👈 biggest profit first
		},
	})

	console.log('token pnl', data)

	const solPrice = await getSolPrice()

	return data.map(pnl => toPnl(pnl, solPrice))
}

export function toPnl(tokenPnl: TokenPnlRow, solPrice: number) {
	const bought = solToUsd(new Decimal(tokenPnl.bought.toString()).div(1e9), solPrice).toNumber()
	const sold = solToUsd(new Decimal(tokenPnl.sold.toString()).div(1e9), solPrice).toNumber()

	const realizedPnl = solToUsd(new Decimal(tokenPnl.realizedPnl.toString()).div(1e9), solPrice).toNumber()

	return { signer: tokenPnl.signer, tokenId: tokenPnl.tokenId, bought, sold, realizedPnl }
}

export type TokenPnl = ReturnType<typeof toPnl>
