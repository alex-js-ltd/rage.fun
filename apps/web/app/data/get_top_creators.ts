import { prisma } from '@/app/utils/db'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Decimal } from 'decimal.js'
import 'server-only'

export async function getTopCreators(limit = 10) {
	const aggregated = await prisma.harvestEvent.groupBy({
		by: ['signer'], // group by wallet address
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

	const creators = await Promise.all(
		aggregated.map(async row => {
			const user = await prisma.user.findUnique({
				where: { id: row.signer },
				select: {
					id: true,
					createdAt: true,
					tokens: {
						select: {
							id: true,
							metadata: {
								select: {
									name: true,
									symbol: true,
									image: true,
								},
							},
						},
					},
				},
			})

			const totalYieldSol = new Decimal(row._sum.lamports?.toString() ?? 0).div(LAMPORTS_PER_SOL).toNumber()

			return {
				signer: row.signer,
				totalYieldSol,
				user,
			}
		}),
	)

	return creators
}
