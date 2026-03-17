import type { SwapEvent } from '@/app/data/get_swap_events'
import {
	createChart,
	ColorType,
	ISeriesApi,
	IChartApi,
	TickMarkType,
	DeepPartial,
	ChartOptions,
	UTCTimestamp,
	CandlestickData,
	SeriesMarker,
	CandlestickSeries,
} from 'lightweight-charts'
import { useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'
import { formatTinyNumber } from '@/app/utils/misc'

dayjs.extend(utc)

export function useCandlestickChart(
	data: CandlestickData[],
	markers: SeriesMarker<UTCTimestamp>[],
	mint: string,
	interval: number,
) {
	const chartContainerRef = useRef<HTMLDivElement | null>(null)
	const chartRef = useRef<IChartApi | null>(null)
	const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
	useEffect(() => {
		if (!chartContainerRef.current || !data || !interval) return

		const chartOptions: DeepPartial<ChartOptions> = {
			layout: {
				background: { color: 'hsl(199, 28%, 9%)', type: ColorType.Solid },
				textColor: '#a1a1aa',
			},
			grid: {
				vertLines: { color: '#FFFFFF20', visible: true, style: 1 },
				horzLines: { color: '#FFFFFF20', visible: true, style: 1 },
			},

			height: 255,
			width: 600,
			rightPriceScale: { borderColor: '#FFFFFF20', mode: 1, visible: true, borderVisible: true },
			timeScale: {
				tickMarkFormatter: (time: number, _tickMarkType: TickMarkType) => {
					return dayjs(time * 1000)
						.utc()
						.format('H:mm')
				},

				visible: true, // ✅ Must be true
				borderVisible: true,
				timeVisible: true, // ✅ Show timestamps
				secondsVisible: true,
				borderColor: '#FFFFFF20',
				rightOffset: 20,
			},

			localization: {
				timeFormatter: (time: number) => {
					return dayjs(time * 1000)
						.utc()
						.format('H:mm')
				},
			},

			crosshair: {
				mode: 2,
				vertLine: { width: 1, color: '#ffffff55', style: 0, labelBackgroundColor: '#000000AA' },
				horzLine: { width: 1, color: '#ffffff55', style: 0, labelBackgroundColor: '#000000AA' },
			},
		}

		const chart = createChart(chartContainerRef.current, chartOptions)

		chartRef.current = chart

		chart.priceScale('right').applyOptions({
			scaleMargins: {
				top: 0.1,
				bottom: 0.0,
			},

			mode: 1,
			autoScale: true,
		})

		const series = chart.addSeries(CandlestickSeries, {
			borderVisible: true,

			priceLineVisible: true,
			wickVisible: true,

			upColor: green,
			downColor: red,
			wickUpColor: green,
			wickDownColor: red,
			borderUpColor: green,
			borderDownColor: red,

			priceFormat: {
				type: 'custom',
				formatter: (val: number) => {
					return formatTinyNumber(val)
				},
			},
		})

		seriesRef.current = series
		series.setData(data)

		// series.setMarkers(markers)

		chart.timeScale().scrollToRealTime()

		return () => {
			if (chartRef.current) {
				chartRef.current.remove()
			}
		}
	}, [data, markers, interval])

	useChannel('swapEvent', (message: Ably.Message) => {
		const swapEvent: SwapEvent = message.data

		if (swapEvent.tokenId !== mint) return

		const series = seriesRef.current
		const chart = chartRef.current

		const currentData = seriesRef.current?.data() as CandlestickData[]

		const lastCandle = currentData ? currentData[currentData?.length - 1] : undefined

		const { time, value } = formatEvent(swapEvent)

		const roundedTime = time - (time % interval)

		if (lastCandle && lastCandle.time === roundedTime) {
			series?.update({
				...lastCandle,
				close: value,
				high: Math.max(lastCandle.high, value),
				low: Math.min(lastCandle.low, value),
			})
		} else {
			const open = lastCandle?.close ? lastCandle.close : value

			const newCandle: CandlestickData = {
				time: roundedTime as UTCTimestamp,
				open,
				high: value,
				low: value,
				close: value,
			}

			series?.update(newCandle)
		}
	})

	return { ref: chartContainerRef }
}

function formatEvent(e: SwapEvent) {
	return { time: e.time, value: e.price }
}

const green = '#8DF0CC' // lime green (buy candle fill)
const red = '#E5989B'
