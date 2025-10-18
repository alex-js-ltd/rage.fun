import { type TransactionTableType, createTransactionTableSchema } from '@/app/utils/schemas'
import { getSolPrice } from '@/app/data/get_sol_price'
import { getSwapEvents } from '@/app/data/get_swap_events'
import { getDecimals } from '@/app/data/get_decimals'
import dayjs from 'dayjs'
import 'server-only'

export async function getTransactionData(mint: string) {
	const [swapEvents, decimals, solPrice] = await Promise.all([getSwapEvents(mint), getDecimals(mint), getSolPrice()])

	swapEvents.sort(
		(a, b) => dayjs.unix(Number(b?.time.toString())).valueOf() - dayjs.unix(Number(a?.time.toString())).valueOf(),
	)
	const TransactionTableSchema = createTransactionTableSchema({ decimals, solPrice })

	const transactionData = swapEvents.reduce<TransactionTableType[]>((acc, curr) => {
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
