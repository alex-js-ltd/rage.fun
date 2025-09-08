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

import { Interval } from '@/app/comps/interval_panel'
import { SwapEventType } from '@/app/utils/schemas'
import Decimal from 'decimal.js'

dayjs.extend(utc)

export function useLightweightChart(data: OhlcData[], mint: string, interval: Interval) {
	const chartContainerRef = useRef<HTMLDivElement | null>(null)
	const chartRef = useRef<IChartApi | null>(null)
	const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

	useEffect(() => {
		if (!chartContainerRef.current || !data) return

		const chartOptions: DeepPartial<ChartOptions> = {
			layout: {
				background: { color: 'hsl(200, 4%, 15%)', type: ColorType.Solid },
				textColor: '#a1a1aa',
			},
			grid: {
				vertLines: { color: '#FFFFFF20' },
				horzLines: { color: '#FFFFFF20' },
			},

			height: 255,
			rightPriceScale: { borderColor: '#FFFFFF20' },
			timeScale: {
				tickMarkFormatter: (time: number, _tickMarkType: TickMarkType) => {
					return dayjs(time).utc().format('H:mm')
				},
			},

			localization: {
				timeFormatter: (time: number) => {
					return dayjs(time).utc().format('H:mm')
				},
			},
			autoSize: true,
		}

		const chart = createChart(chartContainerRef.current, chartOptions)

		// Setting the border color for the horizontal axis
		chart.timeScale().applyOptions({ barSpacing: 0, minBarSpacing: 0 })

		chartRef.current = chart
		chart.timeScale().fitContent()

		// Setting the border color for the horizontal axis
		chart.timeScale().applyOptions({
			borderColor: '#FFFFFF20',
		})

		chart.priceScale('right').applyOptions({
			scaleMargins: {
				top: 0.1,
				bottom: 0.0,
			},

			mode: 1,
		})

		const upColor = '#34d399'
		const downColor = '#f87171'

		const newSeries = chart.addCandlestickSeries({
			borderVisible: false,
			upColor,
			downColor,
			wickUpColor: upColor,
			wickDownColor: downColor,
			priceLineVisible: true,
			wickVisible: true,
			priceFormat: {
				type: 'custom',
				formatter: (val: number) => {
					return val.toFixed(12)
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
			const newCandle: OhlcData = {
				time: roundedTime as UTCTimestamp,
				open: formattedEvent.value,
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
