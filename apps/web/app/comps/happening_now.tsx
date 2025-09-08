'use client'

import Image from 'next/image'
import { AirdropSignatureType } from '@/app/utils/schemas'
import { use, useState, useRef } from 'react'
import { Loading } from '@/app/comps/loading'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'

import { createPngDataUri } from 'unlazy/thumbhash'

export function HappeningNow({ happeningPromise }: { happeningPromise: Promise<AirdropSignatureType[]> }) {
	const data = use(happeningPromise)

	const [state, setState] = useState<AirdropSignatureType[]>(data)

	const { channel } = useChannel('airdropEvent', (message: Ably.Message) => {
		const airdropEvent: AirdropSignatureType = message.data

		setState(prev => [airdropEvent, ...prev.slice(0, -1)])

		// After setting the new state, scroll back to left
		requestAnimationFrame(() => {
			if (scrollRef.current) {
				scrollRef.current.scrollLeft = 0
			}
		})
	})

	const scrollRef = useRef<HTMLDivElement>(null)

	return (
		<div className="relative box-border pb-2 pt-2 -mt-2 -mb-2">
			<div
				ref={scrollRef}
				className="overflow-x-auto pb-8 mb-0 pt-2 overflow-y-hidden flex flex-col scrollbar-none"
				style={{
					scrollSnapType: 'x mandatory',
					overscrollBehaviorX: 'contain',
					scrollbarWidth: 'none',
				}}
			>
				<div className="flex">
					{state.map(h => (
						<Box key={h.id} happening={h} />
					))}
				</div>
			</div>
		</div>
	)
}

function Box({ happening }: { happening: AirdropSignatureType }) {
	const { id: sig, airdropId } = happening

	const { id: mint, name, symbol, image, thumbhash } = happening.token

	return (
		<div
			className="shrink-0 snap-start flex flex-col"
			style={{
				marginInlineEnd: '8px',
				flexBasis:
					'max(max(max(max(max(calc((100% - 40px) / 6), min(calc((100% - 32px) / 5), calc((1390px - 100%) * 9999))), min(calc((100% - 24px) / 4), calc((1157px - 100%) * 9999))), min(calc((100% - 16px) / 3), calc((924px - 100%) * 9999))), min(calc((100% - 8px) / 2), calc((691px - 100%) * 9999))), min(calc(100% / 1), calc((458px - 100%) * 9999)))',
			}}
		>
			<div className="flex flex-col rounded-lg overflow-hidden border border-white border-opacity-[0.125] ">
				<div className="p-2 bg-background-200 w-full flex items-center gap-2">
					<a
						className="relative w-7 aspect-square rounded-md overflow-hidden"
						href={`/token/${mint}?interval=86400000`}
					>
						<Image
							priority
							src={image}
							alt={name}
							blurDataURL={createPngDataUri(thumbhash)}
							placeholder="blur"
							className="object-cover object-center w-full h-full"
							fill={true}
							sizes="56px"
						/>
					</a>

					<span className="text-[0.9375rem] text-text-100">{symbol}</span>
				</div>

				<div className="relative w-full" style={{ paddingTop: '56.497%' }}>
					<Image
						src={'/airdrop.webp'}
						alt={name}
						className="object-cover"
						fill={true}
						blurDataURL={createPngDataUri(thumbhash)}
						placeholder="blur"
						sizes="(min-width: 1280px) 14vw, (min-width: 1024px) 16vw, (min-width: 768px) 20vw, (min-width: 640px) 25vw, 33vw"
					/>
				</div>

				<div className="h-[76px] flex w-full">
					<div className="py-[14px] pl-2 pr-2  flex flex-col justify-between">
						<a
							target="_blank"
							href={`https://solscan.io/tx/${sig}`}
							className="leading-[1.2308] font-semibold text-[0.8125rem] text-text-200"
						>
							<span className="text-text-200">{`AIRDROP #${airdropId} UNLOCKED`}</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	)
}

export function Fallback({ length }: { length: number }) {
	return (
		<div className="relative box-border pb-2 pt-2 -mt-2 -mb-2">
			<div
				className="overflow-x-auto pb-8 mb-0 pt-2 overflow-y-hidden flex flex-col scrollbar-none"
				style={{
					scrollSnapType: 'x mandatory',
					overscrollBehaviorX: 'contain',
					scrollbarWidth: 'none',
				}}
			>
				<div className="flex">
					{Array.from({ length }, (v, index) => ({
						id: `loading-card-${index}`,
					})).map((h, i) => (
						<div
							key={h.id}
							className="shrink-0 snap-start flex flex-col"
							style={{
								marginInlineEnd: '8px',
								flexBasis:
									'max(max(max(max(max(calc((100% - 40px) / 6), min(calc((100% - 32px) / 5), calc((1390px - 100%) * 9999))), min(calc((100% - 24px) / 4), calc((1157px - 100%) * 9999))), min(calc((100% - 16px) / 3), calc((924px - 100%) * 9999))), min(calc((100% - 8px) / 2), calc((691px - 100%) * 9999))), min(calc(100% / 1), calc((458px - 100%) * 9999)))',
							}}
						>
							<div className="flex flex-col rounded-lg overflow-hidden border border-white border-opacity-[0.125] ">
								{/* Simulating Facebook's nested div */}

								<div className="p-2 bg-background-200 w-full flex items-center gap-2">
									<div className="relative w-7 h-7 rounded-md overflow-hidden">
										<Loading i={i} />
									</div>

									<span className="text-[0.9375rem] text-text-100">
										<Loading i={i} />
									</span>
								</div>

								<div className="relative w-full" style={{ paddingTop: '56.497%' }}>
									{/*make fallback skelton match size of image */}

									<div className="absolute inset-0 w-full h-full">
										<Loading i={i} />
									</div>
								</div>

								<div className="h-[76px] flex w-full">
									<div className="py-[14px] pl-2 pr-2  flex flex-col justify-between">
										<div className="leading-[1.2308] font-semibold text-[0.8125rem] text-text-200">
											<Loading i={i} />
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
