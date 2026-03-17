'use client'

import { use } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useCandlestickChart } from '@/app/hooks/use_candlestick_chart'
import { CandlestickData, SeriesMarker, UTCTimestamp } from 'lightweight-charts'

dayjs.extend(utc)

type CandlestickChartProps = {
	chartPromise: Promise<{ data: CandlestickData[]; markers: SeriesMarker<UTCTimestamp>[] }>
	mint: string
	interval: number
}

export function CandlestickChart({ chartPromise, mint, interval }: CandlestickChartProps) {
	const res = use(chartPromise)

	const { ref } = useCandlestickChart(res.data, res.markers, mint, interval)

	return <div ref={ref} key={interval} className="relative w-full max-w-[600px] overflow-hidden min-h-[255px]" />
}
