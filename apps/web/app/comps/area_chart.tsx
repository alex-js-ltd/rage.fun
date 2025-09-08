'use client'

import {
	createChart,
	ColorType,
	ISeriesApi,
	IChartApi,
	TickMarkType,
	OhlcData,
	AreaData,
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

import { Interval } from '@/app/comps/interval_panel'
import { SwapEventType } from '@/app/utils/schemas'
import Decimal from 'decimal.js'

dayjs.extend(utc)

export function useAreaChart(data: AreaData[] = initialData) {
	const chartContainerRef = useRef<HTMLDivElement | null>(null)
	const chartRef = useRef<IChartApi | null>(null)
	const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)

	useEffect(() => {
		if (!chartContainerRef.current || !data) return

		const chartOptions: DeepPartial<ChartOptions> = {
			layout: {
				background: { color: 'transparent', type: ColorType.Solid },
				textColor: '#a1a1aa',
				attributionLogo: false,
			},
			grid: {
				vertLines: { color: 'transparent' },
				horzLines: { color: 'transparent' },
			},

			height: 74,
			rightPriceScale: { visible: false },

			watermark: {
				visible: false,
			},

			timeScale: {
				borderVisible: false,
				fixLeftEdge: true,
				fixRightEdge: true,
				lockVisibleTimeRangeOnResize: true,
				visible: false,
			},

			autoSize: true,

			crosshair: {
				vertLine: { visible: false },
				horzLine: { visible: false },
				mode: 0, // no crosshair mode
			},
			handleScroll: false,
			handleScale: false,
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

		const newSeries = chart.addAreaSeries({
			// no marker dot
			lastValueVisible: false, // no price label
			priceLineVisible: false,
		})

		seriesRef.current = newSeries
		newSeries.setData(data)

		return () => {
			if (chartRef.current) {
				chartRef.current.remove()
			}
		}
	}, [data])

	return { ref: chartContainerRef }
}

const initialData = [
	{ time: '2018-12-22', value: 32.51 },
	{ time: '2018-12-23', value: 31.11 },
	{ time: '2018-12-24', value: 27.02 },
	{ time: '2018-12-25', value: 27.32 },
	{ time: '2018-12-26', value: 25.17 },
	{ time: '2018-12-27', value: 28.89 },
	{ time: '2018-12-28', value: 25.46 },
	{ time: '2018-12-29', value: 23.92 },
	{ time: '2018-12-30', value: 22.68 },
	{ time: '2018-12-31', value: 22.67 },
]

export function AreaChart(props: { data: AreaData[] }) {
	const { ref } = useAreaChart(props.data)

	return <div ref={ref} className="relative w-full overflow-hidden min-h-[74px]"></div>
}
