import { UTCTimestamp, CandlestickData, SeriesMarker } from 'lightweight-charts'
import { SwapEvent } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { getCreatorId } from '@/app/data/get_creator_id'
import { getSwapEvents } from '@/app/data/get_swap_events'
import 'server-only'

const green = '#8DF0CC' // lime green (buy candle fill)
const red = '#E5989B'

function generateCandlestickData(events: SwapEvent[], interval: number): CandlestickData[] {
	if (!events.length) return []

	const ticks = events
		.map(e => ({ time: Number(e.time), value: e.price.toNumber() })) // seconds
		.sort((a, b) => a.time - b.time)

	const bucketStart = (t: number) => (Math.floor(t / interval) * interval) as UTCTimestamp

	const candles: CandlestickData[] = []

	let curBucket = bucketStart(ticks[0].time)
	let cur: CandlestickData = {
		time: curBucket,
		open: 0,
		high: ticks[0].value,
		low: ticks[0].value,
		close: ticks[0].value,
	}

	for (let i = 1; i < ticks.length; i++) {
		const { time, value } = ticks[i]
		const b = bucketStart(time)

		if (b === curBucket) {
			if (value > cur.high) cur.high = value
			if (value < cur.low) cur.low = value
			cur.close = value
			continue
		}

		// bucket advanced → finalize previous candle
		candles.push(cur)

		// continuity only: new.open = previous.close
		curBucket = b
		cur = {
			time: curBucket,
			open: candles[candles.length - 1].close,
			high: value,
			low: value,
			close: value,
		}
	}

	// push the last (in-progress) candle
	candles.push(cur)
	return candles
}

export function generateMarkers(events: SwapEvent[], creatorId: string) {
	const markers = events.reduce<Array<SeriesMarker<UTCTimestamp>>>((acc, curr) => {
		if (curr.signer !== creatorId) return acc

		const isBuy = curr.swapType === 'Buy'
		const color = isBuy ? green : red
		const position = 'aboveBar'
		const shape = 'circle'

		// timestamp → ms → UTCTimestamp
		const timestamp = new Decimal(curr.time.toString()).toNumber() as UTCTimestamp

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
