'use client'

import { use } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useLightweightChart } from '@/app/hooks/use_lightweight_chart'
import { OhlcData } from 'lightweight-charts'

dayjs.extend(utc)

type CandlestickChartProps = {
	ohlcPromise: Promise<OhlcData[]>
	mint: string
	interval: number
}

export function CandlestickChart({ ohlcPromise, mint, interval }: CandlestickChartProps) {
	const data = use(ohlcPromise)

	const { ref } = useLightweightChart(data, mint, interval)

	return <div ref={ref} className="relative col-span-2 w-full overflow-hidden min-h-[255px]" />
}
