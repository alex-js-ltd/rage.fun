import { UTCTimestamp, OhlcData, CandlestickData, SeriesMarker } from 'lightweight-charts'
import { SwapEvent } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { getCreatorId } from '@/app/data/get_creator_id'
import { getSwapEvents } from '@/app/data/get_swap_events'
import 'server-only'

const green = '#8DF0CC' // lime green (buy candle fill)
const red = '#E5989B'

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

	const start: CandlestickData[] = []

	const output = allTimes.reduce((acc, curr, index, arr) => {
		const prev = acc[acc.length - 1]

		let tempObj: Partial<CandlestickData> = {}

		const filteredData = groupedEvents.filter(e => e.time === curr)
		const prices = filteredData.map(el => el.value)
		const time = curr
		const open = index === 0 ? filteredData[0].value : prev.close
		const close = filteredData[filteredData.length - 1].value
		const color = index === 0 ? green : close > open ? green : red

		tempObj.time = time
		tempObj.open = open
		tempObj.close = close
		tempObj.high = Math.max(...prices, open, close)
		tempObj.low = Math.min(...prices, open, close)

		tempObj.color = color
		tempObj.wickColor = color
		tempObj.borderColor = color

		acc.push(tempObj as CandlestickData)

		return acc
	}, start)

	return output
}

export function generateMarkers(events: SwapEvent[], creatorId: string) {
	const markers = events.reduce<Array<SeriesMarker<UTCTimestamp>>>((acc, curr) => {
		if (curr.signer !== creatorId) return acc

		const isBuy = curr.swapType === 'Buy'
		const color = isBuy ? green : red
		const position = 'aboveBar'
		const shape = 'circle'

		// timestamp → ms → UTCTimestamp
		const timestamp = new Decimal(curr.time.toString()).mul(1000).toNumber() as UTCTimestamp

		const text = '🧑‍🎨'

		// check if there's already a marker for this exact candle
		const existing = acc.find(m => m.time === timestamp)
		if (!existing) {
			acc.push({
				time: timestamp,
				position,
				shape,
				color,
				text,
				size: 1,
			})
		}

		return acc
	}, [])

	return markers
}

export async function getCandlstickData(mint: string, interval: number) {
	const [swapEvents, creatorId] = await Promise.all([getSwapEvents(mint), getCreatorId(mint)])

	const data = generateCandlestickData(swapEvents, interval)
	const markers = generateMarkers(swapEvents, creatorId)

	return { data, markers }
}
