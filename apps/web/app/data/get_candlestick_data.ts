import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { UTCTimestamp, OhlcData, CandlestickData } from 'lightweight-charts'
import { SwapEvent } from '@prisma/client'
import { isOhlcData } from '@/app/utils/schemas'
import { Decimal } from '@prisma/client/runtime/library'
import 'server-only'

function generateCandlestickData(events: SwapEvent[], interval: number) {
	const formattedEvents = events.map(e => ({
		time: new Decimal(e.time.toString()).mul(1000).toNumber(),
		value: e.price.toNumber(),
	}))

	const sortedEvents = formattedEvents.sort((a, b) => a.time - b.time)

	const groupedEvents = sortedEvents.map(e => ({
		...e,
		time: (Math.floor(e.time / interval) * interval) as UTCTimestamp,
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

	return stitchCandles(output)
}

export async function getCandlstickData(mint: string, interval: number) {
	console.log('get candle stick data for interval:', interval)
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

const green = '#8DF0CC' // lime green (buy candle fill)
const red = '#E5989B'

/** Visual-only post-processing: force open[i] = close[i-1] */
export function stitchCandles(candles: OhlcData[]) {
	if (!candles.length) return candles

	let prev = { ...candles[0], color: green, wickColor: green, borderColor: green }

	const out: Array<CandlestickData> = [prev] // keep first as-is

	for (let i = 1; i < candles.length; i++) {
		const c = candles[i]
		const open = prev.close
		const close = c.close

		// keep the real range but include the new open
		const high = Math.max(c.high, open, close)
		const low = Math.min(c.low, open, close)

		const color = close === open ? prev.color : close > open ? green : red
		const wickColor = color
		const borderColor = color

		const newCandle = { time: c.time as UTCTimestamp, open, high, low, close, color, wickColor, borderColor }
		out.push(newCandle)
		prev = newCandle
	}

	return out
}
