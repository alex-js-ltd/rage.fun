'use client'

import { use } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useLightweightChart } from '@/app/hooks/use_lightweight_chart'
import { OhlcData, CandlestickData } from 'lightweight-charts'

dayjs.extend(utc)

type CandlestickChartProps = {
	ohlcPromise: Promise<CandlestickData[]>
	mint: string
	interval: number
}

export function CandlestickChart({ ohlcPromise, mint, interval }: CandlestickChartProps) {
	const data = use(ohlcPromise)

	const { ref } = useLightweightChart(data, mint, interval)

	return <div ref={ref} key={interval} className="relative w-full max-w-[600px] overflow-hidden min-h-[255px]" />
}
