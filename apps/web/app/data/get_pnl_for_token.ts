import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { getSolPrice } from '@/app/data/get_sol_price'
import Decimal from 'decimal.js'
import { solToUsd } from '@/app/utils/misc'
import 'server-only'

const select = Prisma.validator<Prisma.TokenPnlSelect>()({
	tokenId: true,
	signer: true,
	bought: true,
	sold: true,
	realizedPnl: true,
})

type TokenPnlPayload = Prisma.TokenPnlGetPayload<{
	select: typeof select
}>

export async function getPnLForToken(mint: string) {
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

	const solPrice = await getSolPrice()

	return data.map(pnl => toPnl(pnl, solPrice))
}

function toPnl(tokenPnl: TokenPnlPayload, solPrice: number) {
	const bought = solToUsd(new Decimal(tokenPnl.bought.toString()).div(1e9), solPrice).toNumber()
	const sold = solToUsd(new Decimal(tokenPnl.sold.toString()).div(1e9), solPrice).toNumber()

	const realizedPnl = solToUsd(new Decimal(tokenPnl.realizedPnl.toString()).div(1e9), solPrice).toNumber()

	return { signer: tokenPnl.signer, bought, sold, realizedPnl }
}

export type PnL = ReturnType<typeof toPnl>
