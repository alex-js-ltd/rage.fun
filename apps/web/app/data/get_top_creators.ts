import { prisma } from '@/app/utils/db'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Decimal } from 'decimal.js'
import { solToUsd } from '@/app/utils/misc'
import { getSolPrice } from '@/app/data/get_sol_price'
import 'server-only'

export async function getTopCreators(limit = 3) {
	const aggregated = await prisma.harvestEvent.groupBy({
		by: ['signer'],
		_sum: {
			lamports: true,
		},
		orderBy: {
			_sum: {
				lamports: 'desc',
			},
		},
		take: limit,
	})

	const solPrice = await getSolPrice()

	const creators = await Promise.all(
		aggregated.map(async row => {
			const user = await prisma.user.findUnique({
				where: { id: row.signer },
				include: { accounts: true },
			})

			const totalYieldSol = new Decimal(row._sum.lamports?.toString() ?? 0).div(LAMPORTS_PER_SOL)

			const discord = user?.accounts.filter(({ provider }) => provider === 'discord')[0]
			console.log(discord)

			const uiAmount = solToUsd(totalYieldSol, solPrice).toNumber().toFixed(2)
			return {
				user: { id: user?.id },
				yield: { uiAmount },
			}
		}),
	)

	return creators
}
