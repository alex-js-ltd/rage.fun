'use client'

import {
	createChart,
	ColorType,
	ISeriesApi,
	IChartApi,
	TickMarkType,
	OhlcData,
	DeepPartial,
	ChartOptions,
	UTCTimestamp,
} from 'lightweight-charts'
import { useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { isOhlcData } from '@/app/utils/schemas'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'

import { BN } from '@coral-xyz/anchor'

import { SwapEventType } from '@/app/utils/schemas'
import Decimal from 'decimal.js'

dayjs.extend(utc)

export function useLightweightChart(data: OhlcData[], mint: string, interval: number) {
	const chartContainerRef = useRef<HTMLDivElement | null>(null)
	const chartRef = useRef<IChartApi | null>(null)
	const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
	useEffect(() => {
		if (!chartContainerRef.current || !data) return

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
			rightPriceScale: { borderColor: '#FFFFFF20', mode: 1 },
			timeScale: {
				tickMarkFormatter: (time: number, _tickMarkType: TickMarkType) => {
					return dayjs(time).utc().format('H:mm')
				},

				visible: true, // ✅ Must be true
				borderVisible: true,
				timeVisible: true, // ✅ Show timestamps
				secondsVisible: true,
				borderColor: '#FFFFFF20',
			},

			localization: {
				timeFormatter: (time: number) => {
					return dayjs(time).utc().format('H:mm')
				},
			},

			crosshair: {
				mode: 2,
				vertLine: { width: 1, color: '#ffffff55', style: 0, labelBackgroundColor: '#000000AA' },
				horzLine: { width: 1, color: '#ffffff55', style: 0, labelBackgroundColor: '#000000AA' },
			},
		}

		const chart = createChart(chartContainerRef.current, chartOptions)

		// Setting the border color for the horizontal axis
		// chart.timeScale().applyOptions({ barSpacing: 0, minBarSpacing: 0 })

		chart.timeScale().applyOptions({
			barSpacing: 0, // smaller number = candles closer together
			rightOffset: 0, // keep some breathing room on the right
			fixLeftEdge: false, // allow chart to pan
			lockVisibleTimeRangeOnResize: false,
			minBarSpacing: 0,
		})

		chartRef.current = chart

		chart.priceScale('right').applyOptions({
			scaleMargins: {
				top: 0.1,
				bottom: 0.0,
			},

			mode: 0,
			autoScale: true,
		})

		chart.timeScale().fitContent()

		const green = '#34d399'
		const red = '#f87171'

		// Candle bodies
		const upColor = '#8DF0CC' // lime green (buy candle fill)
		const downColor = '#E5989B'

		const newSeries = chart.addCandlestickSeries({
			borderVisible: true,
			upColor,
			downColor,
			wickUpColor: upColor,
			wickDownColor: downColor,

			borderUpColor: upColor,
			borderDownColor: downColor,

			priceLineVisible: true,
			wickVisible: true,
			priceFormat: {
				type: 'custom',
				formatter: (val: number) => {
					return val.toFixed(9)
				},
			},
		})

		seriesRef.current = newSeries
		newSeries.setData(data)

		return () => {
			if (chartRef.current) {
				chartRef.current.remove()
			}
		}
	}, [data])

	const { channel } = useChannel('swapEvent', (message: Ably.Message) => {
		const swapEvent: SwapEventType = message.data

		const { tokenId, price, time } = swapEvent

		if (tokenId !== mint) return

		const newSeries = seriesRef.current

		const currentData = seriesRef.current?.data().filter(isOhlcData)

		console.log('currentData', currentData)

		const lastCandle = currentData ? currentData[currentData?.length - 1] : undefined

		const formattedEvent = formatEvent({ price, time })

		const roundedTime = formattedEvent.time - (formattedEvent.time % interval)

		if (lastCandle && lastCandle.time === roundedTime) {
			const newData = [
				...(currentData?.slice(0, -1) || []),
				{
					...lastCandle,
					close: formattedEvent.value,
					high: Math.max(lastCandle.high, formattedEvent.value),
					low: Math.min(lastCandle.low, formattedEvent.value),
				},
			]

			newSeries?.setData(newData)
		} else {
			const prevClose = lastCandle?.close

			const newCandle: OhlcData = {
				time: roundedTime as UTCTimestamp,
				open: prevClose ? prevClose : formattedEvent.value,
				high: formattedEvent.value,
				low: formattedEvent.value,
				close: formattedEvent.value,
			}

			newSeries?.setData(currentData ? [...currentData, newCandle] : [newCandle])
		}
	})

	return { ref: chartContainerRef }
}

function formatEvent(e: { time: string; price: number }) {
	return { time: new Decimal(e.time.toString()).mul(1000).toNumber(), value: e.price }
}
