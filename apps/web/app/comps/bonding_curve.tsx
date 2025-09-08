'use client'

import { useState, use } from 'react'
import { type TokenWithRelationsType } from '@/app/utils/schemas'
import { Progress } from './progress'
import { createPngDataUri } from 'unlazy/thumbhash'
import { fromLamports } from '@repo/magicmint'
import { formatCompactNumber } from '@/app/utils/misc'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'

import { Loading } from './loading'
import { BN } from '@coral-xyz/anchor'

interface BondingCurveProps {
	tokenPromise: Promise<TokenWithRelationsType>
}

export function BondingCurve({ tokenPromise }: BondingCurveProps) {
	const token = use(tokenPromise)

	const [state, setState] = useState<TokenWithRelationsType>(token)

	const { id: mint, thumbhash } = state

	const { progress, reserveBalance, targetReserve, connectorWeight, totalSupply, decimals } = state.bondingCurve

	useChannel('updateEvent', (message: Ably.Message) => {
		const updateEvent: TokenWithRelationsType = message.data

		if (updateEvent.id === state.id) {
			setState(updateEvent)
		}
	})

	return (
		<div className="relative grid h-full gap-0 overflow-hidden border border-white border-opacity-[0.125] p-4 rounded-xl min-h-[172px] ">
			<div className="relative z-20 grid grid-cols-[1fr_1px_1fr_1px_1fr] gap-2">
				<div className="text text-text-200 text-xs self-center flex flex-col items-center gap-0.5">
					<span>Liquidity:</span>
					<span>{` ${fromLamports(new BN(reserveBalance), 9).toFixed(9)} / ${fromLamports(new BN(targetReserve), 9)} SOL`}</span>
				</div>

				<div className="w-px bg-white bg-opacity-[0.125]" />

				<div className="text text-text-200 text-xs self-center flex flex-col items-center gap-0.5">
					<span>Connector weight:</span>
					<span>{`${connectorWeight}`}</span>
				</div>

				<div className="w-px bg-white bg-opacity-[0.125]" />

				<div className="text text-text-200 text-xs self-center flex flex-col items-center gap-0.5">
					<span>Circulating supply:</span>
					<span>{`${formatCompactNumber(fromLamports(new BN(totalSupply.toString()), decimals))}`}</span>
				</div>
			</div>

			<Progress progress={progress} mint={mint} className="z-10" />

			<div
				className="absolute inset-0 bg-cover bg-center z-0"
				style={{ backgroundImage: `url(${createPngDataUri(thumbhash)})` }}
			/>

			<div className="absolute inset-0 frost" />
		</div>
	)
}

export function BondingCurveFallback() {
	return (
		<div className="relative grid h-full gap-0 overflow-hidden border border-white border-opacity-[0.125] p-4 rounded-xl min-h-[172px] ">
			<div className="relative z-20 grid grid-cols-[1fr_1px_1fr_1px_1fr] gap-3">
				<div className="text text-text-200 text-xs self-center flex flex-col items-center gap-0.5">
					<span>Liquidity:</span>
					<Loading i={0} className="h-[18px] rounded"></Loading>
				</div>

				<div className="w-px bg-white bg-opacity-[0.125]" />

				<div className="text text-text-200 text-xs self-center flex flex-col items-center gap-0.5">
					<span>Connector weight:</span>
					<Loading i={0} className="h-[18px] rounded"></Loading>
				</div>

				<div className="w-px bg-white bg-opacity-[0.125]" />

				<div className="text text-text-200 text-xs self-center flex flex-col items-center gap-0.5">
					<span>Circulating supply:</span>
					<Loading i={0} className="h-[18px] rounded"></Loading>
				</div>
			</div>

			<div className="z-10 mt-auto rounded-full p-3 border border-white border-opacity-[0.125]">
				<Loading
					i={9}
					className="z-10 h-[32px] mt-auto rounded-full relative overflow-hidden bg-transparent w-full  border border-white border-opacity-[0.125]"
				/>
			</div>

			<Loading i={10} className="absolute inset-0 bg-cover bg-center z-0" />
		</div>
	)
}
