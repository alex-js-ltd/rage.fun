import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { type TransactionTableType, createTransactionTableSchema } from '@/app/utils/schemas'
import { getSolPrice } from '@/app/data/get_sol_price'
import 'server-only'

export async function getTransactionData(mint: string) {
	const query = Prisma.validator<Prisma.TokenFindFirstOrThrowArgs>()({
		where: {
			id: mint,

			bondingCurve: {
				isNot: null,
			},
		},
		select: {
			bondingCurve: {
				select: {
					decimals: true,
				},
			},

			swapEvents: {
				select: {
					id: true,
					signer: true,
					time: true,
					price: true,
					tokenAmount: true,
					lamports: true,
					swapType: true,
					rentAmount: true,
					tokenId: true,
				},
				where: {
					lamports: {
						not: BigInt(0),
					},
				},
				orderBy: {
					time: 'desc', // Or another timestamp field like 'timestamp'/'blockTime'
				},
			},
		},
	})

	const token = await prisma.token.findUniqueOrThrow(query)

	const { decimals } = token?.bondingCurve || {}

	if (!decimals) {
		throw new Error('poop')
	}

	const solPrice = await getSolPrice()

	const TransactionTableSchema = createTransactionTableSchema({ decimals, solPrice })

	const transactionData = token?.swapEvents.reduce<TransactionTableType[]>((acc, curr) => {
		const parsed = TransactionTableSchema.safeParse(curr)

		if (parsed.success) {
			acc.push(parsed.data)
		} else {
			console.error(parsed.error)
		}

		return acc
	}, [])

	return transactionData
}

export const dynamic = 'force-dynamic'
