import { getSolPrice } from '@/app/data/get_sol_price'
import { getSwapEvents } from '@/app/data/get_swap_events'
import { getDecimals } from '@/app/data/get_decimals'
import dayjs from 'dayjs'
import { SwapEvent } from '@prisma/client'
import { fromLamports } from '@repo/rage'
import { formatCompactNumber, solToUsd } from '@/app/utils/misc'
import Decimal from 'decimal.js'
import { BN } from '@coral-xyz/anchor'
import 'server-only'

export async function getTransactionData(mint: string) {
	const [swapEvents, decimals, solPrice] = await Promise.all([getSwapEvents(mint), getDecimals(mint), getSolPrice()])

	swapEvents.sort(
		(a, b) => dayjs.unix(Number(b?.time.toString())).valueOf() - dayjs.unix(Number(a?.time.toString())).valueOf(),
	)

	return swapEvents.map(swapEvent => {
		return toTransactionData(swapEvent, decimals, solPrice)
	})
}

function toTransactionData(swapEvent: SwapEvent, decimals: number, solPrice: number) {
	const uiResult = fromLamports(new BN(swapEvent.tokenAmount), decimals)

	const uiAmount = formatCompactNumber(uiResult)

	const volumeSol = new Decimal(swapEvent.lamports).div(1e9)

	const volume = solToUsd(volumeSol, solPrice).toNumber()

	const avg = volumeSol.div(new Decimal(uiResult))

	const price = solToUsd(avg, solPrice).toNumber()

	return {
		id: swapEvent.id,
		time: swapEvent.time.toString(),
		swapType: swapEvent.swapType,
		signer: swapEvent.signer,
		tokenId: swapEvent.tokenId,

		price,
		volume,
		uiAmount,
	}
}

export type TransactionData = ReturnType<typeof toTransactionData>
