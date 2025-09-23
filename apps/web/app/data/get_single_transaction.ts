import { prisma } from '@/app/utils/db'
import { Prisma, SwapEvent } from '@prisma/client'
import { type TransactionTableType, createTransactionTableSchema } from '@/app/utils/schemas'
import { getCachedSolPrice } from '@/app/data/get_sol_price'
import { getCachedDecimals } from './get_decimals'
import 'server-only'

export async function getSingleTransaction(signature: string): Promise<TransactionTableType> {
	const query = Prisma.validator<Prisma.SwapEventFindFirstOrThrowArgs>()({
		where: {
			id: signature,
		},
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
	})

	const swapEvent = await prisma.swapEvent.findUniqueOrThrow(query)

	const decimals = await getCachedDecimals(swapEvent.tokenId)
	const solPrice = await getCachedSolPrice()

	const TransactionTableSchema = createTransactionTableSchema({ decimals, solPrice })

	const parsed = TransactionTableSchema.safeParse(swapEvent)

	if (parsed.error) {
		console.error('❌', parsed.error)
		throw new Error(`🚨 Failed to parse transaction ${signature} 🧨`)
	}

	return parsed.data
}

export async function getTransaction(swapEvent: SwapEvent) {
	const decimals = await getCachedDecimals(swapEvent.tokenId)
	const solPrice = await getCachedSolPrice()

	const TransactionTableSchema = createTransactionTableSchema({ decimals, solPrice })

	const parsed = TransactionTableSchema.safeParse(swapEvent)

	if (parsed.error) {
		console.error('❌', parsed.error)
		throw new Error(`🚨 Failed to parse transaction ${swapEvent.id} 🧨`)
	}

	return parsed.data
}
