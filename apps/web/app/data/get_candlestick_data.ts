import { UTCTimestamp, OhlcData, CandlestickData, SeriesMarker } from 'lightweight-charts'
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
		open: ticks[0].value,
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

let randomFactor = 25 + Math.random() * 25
const samplePoint = (i: number) =>
	i *
		(0.5 + Math.sin(i / 1) * 0.2 + Math.sin(i / 2) * 0.4 + Math.sin(i / randomFactor) * 0.8 + Math.sin(i / 50) * 0.5) +
	200 +
	i * 2

function generateData(numberOfCandles = 500, updatesPerCandle = 5, startAt = 100) {
	const createCandle = (val: number, time: UTCTimestamp) => ({
		time,
		open: val,
		high: val,
		low: val,
		close: val,
	})

	const updateCandle = (candle: CandlestickData, val: number) => ({
		time: candle.time,
		close: val,
		open: candle.open,
		low: Math.min(candle.low, val),
		high: Math.max(candle.high, val),
	})

	randomFactor = 25 + Math.random() * 25
	const date = new Date(Date.UTC(2018, 0, 1, 12, 0, 0, 0))

	const numberOfPoints = numberOfCandles * updatesPerCandle

	const initialData = []
	const realtimeUpdates = []

	let lastCandle
	let previousValue = samplePoint(-1)

	for (let i = 0; i < numberOfPoints; ++i) {
		if (i % updatesPerCandle === 0) {
			date.setUTCDate(date.getUTCDate() + 1)
		}
		const time = (date.getTime() / 1000) as UTCTimestamp
		let value = samplePoint(i)
		const diff = (value - previousValue) * Math.random()
		value = previousValue + diff
		previousValue = value
		if (i % updatesPerCandle === 0) {
			const candle = createCandle(value, time)
			lastCandle = candle
			if (i >= startAt) {
				realtimeUpdates.push(candle)
			}
		} else {
			const newCandle: CandlestickData | undefined = lastCandle && updateCandle(lastCandle, value)
			lastCandle = newCandle
			if (i >= startAt) {
				realtimeUpdates.push(newCandle)
			} else if ((i + 1) % updatesPerCandle === 0) {
				initialData.push(newCandle)
			}
		}
	}

	return {
		initialData,
		realtimeUpdates,
	}
}
