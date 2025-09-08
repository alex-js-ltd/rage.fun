import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { Interval } from '@/app/comps/interval_panel'
import { UTCTimestamp, OhlcData } from 'lightweight-charts'
import { SwapEvent } from '@prisma/client'
import { isOhlcData } from '@/app/utils/schemas'
import { Decimal } from '@prisma/client/runtime/library'
import 'server-only'

function generateCandlestickData(events: SwapEvent[], interval: Interval) {
	const formattedEvents = events.map(e => ({
		time: new Decimal(e.time.toString()).mul(1000).toNumber(),
		value: e.price.toNumber(),
	}))

	const sortedEvents = formattedEvents.sort((a, b) => a.time - b.time)

	const groupedEvents = sortedEvents.map(e => ({
		...e,
		time: (e.time - (e.time % interval)) as UTCTimestamp,
	}))

	const allTimes = [...new Set(groupedEvents.map(e => e.time))]

	const start: OhlcData[] = []

	const output = allTimes.reduce((acc, curr) => {
		let tempObj: Partial<OhlcData> = {}

		const filteredData = groupedEvents.filter(e => e.time === curr)
		const prices = filteredData.map(el => el.value)
		tempObj.time = curr
		tempObj.open = filteredData[0].value
		tempObj.close = filteredData[filteredData.length - 1].value
		tempObj.high = Math.max(...prices)
		tempObj.low = Math.min(...prices)

		if (isOhlcData(tempObj)) {
			acc.push(tempObj)
		} else {
			console.log(`is not ohlc Data ${tempObj}`)
		}

		return acc
	}, start)

	return output
}

export async function getCandlstickData(mint: string, interval: Interval) {
	const query = Prisma.validator<Prisma.SwapEventFindManyArgs>()({
		where: {
			tokenId: mint,

			lamports: {
				not: BigInt(0),
			},
		},

		orderBy: {
			time: 'asc',
		},
	})

	const swapEvents = await prisma.swapEvent.findMany(query)

	const data = generateCandlestickData(swapEvents, interval)

	return data
}
