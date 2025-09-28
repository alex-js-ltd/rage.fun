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
		if (!chartContainerRef.current || !data?.length) return

		// Theme tokens (match your Tailwind CSS variables)
		const BG = 'hsl(200, 4%, 15%)' // --background-200
		const TEXT = '#a1a1aa' // --text-200
		const GRID = '#FFFFFF12' // 7% white
		const BORDER = '#FFFFFF20' // 12.5% white

		const upColor = '#34d399'
		const downColor = '#f87171'

		// Dynamic price formatter (auto decimals but caps length)
		const priceFmt = new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 9,
		})

		const chart = createChart(chartContainerRef.current, {
			autoSize: true,
			height: 255,
			layout: {
				background: { color: BG, type: ColorType.Solid },
				textColor: TEXT,
				fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
			},
			grid: {
				vertLines: { color: GRID },
				horzLines: { color: GRID },
			},
			rightPriceScale: {
				borderColor: BORDER,
				scaleMargins: {
					top: 0.15, // more breathing room above candles
					bottom: 0.1,
				},
				entireTextOnly: true,
				alignLabels: true,
			},
			timeScale: {
				borderColor: BORDER,
				rightOffset: 4,
				// spacing tuned for small candles; min prevents collapse
				barSpacing: 6,
				minBarSpacing: 2,
				fixLeftEdge: false,
				fixRightEdge: false,
				// Smart ticks: time for intraday, date for multi-day
				tickMarkFormatter: (t: number, type: TickMarkType) => {
					const d = dayjs.unix(typeof t === 'number' ? t : (t as any))
					return type <= 2 ? d.utc().format('H:mm') : d.utc().format('MMM D')
				},
			},
			crosshair: {
				mode: 1, // Magnet
				vertLine: {
					width: 1,
					color: '#ffffff55',
					style: 0,
					labelBackgroundColor: '#000000AA',
				},
				horzLine: {
					width: 1,
					color: '#ffffff55',
					style: 0,
					labelBackgroundColor: '#000000AA',
				},
			},
			localization: {
				timeFormatter: (t: number) => dayjs.unix(t).utc().format('H:mm'),
				priceFormatter: (v: number) => priceFmt.format(v),
			},
		} as DeepPartial<ChartOptions>)

		chartRef.current = chart

		const series = chart.addCandlestickSeries({
			upColor,
			downColor,
			borderVisible: false,
			wickUpColor: upColor,
			wickDownColor: downColor,
			wickVisible: true,
			priceLineVisible: true,
			priceLineColor: '#ffffff40',

			priceFormat: {
				type: 'custom',
				formatter: (v: number) => priceFmt.format(v),
				minMove: 0.000000001, // enables 9-dec precision without trailing zeros
			},
		})

		seriesRef.current = series
		series.setData(data)

		// Last price marker with subtle bg
		const last = data[data.length - 1]
		if (last) {
			series.setMarkers([
				{
					time: last.time as any,
					position: 'aboveBar',
					shape: 'circle',
					color: '#ffffff55',
					size: 1,
				},
			])
		}

		chart.timeScale().fitContent()

		// Responsive auto-resize (autoSize is good, but this keeps it perfect
		// inside flex/grid parents that change width without window resize)
		const ro = new ResizeObserver(() => {
			chart.applyOptions({ autoSize: true })
		})
		ro.observe(chartContainerRef.current)

		return () => {
			ro.disconnect()
			chart.remove()
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
