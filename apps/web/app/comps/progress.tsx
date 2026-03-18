'use client'

import * as RadixProgress from '@radix-ui/react-progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/comps/ui/tooltip'
import { cn } from '@/app/utils/misc'

interface ProgressProps {
	progress: number
	mint: string
	className?: string
}

export function Progress({ progress, mint, className }: ProgressProps) {
	return (
		<Tooltip>
			<TooltipContent
				className="z-50 bg-background-200 w-fit h-fit text-text-100 px-2 py-1 rounded-full text-xs"
				sideOffset={0}
				align="center"
				alignOffset={0}
				side="bottom"
			>
				{`Bonding curve progress ${progress} % `}

				{progress >= 100.0 && (
					<>
						{' • '}
						<a
							href={`https://raydium.io/swap/?inputMint=${mint}&outputMint=sol`}
							className="underline text-blue-400 hover:text-blue-300"
							target="_blank"
							rel="noopener noreferrer"
						>
							swap now on Raydium 🚀
						</a>
					</>
				)}
			</TooltipContent>

			<TooltipTrigger asChild>
				<div className={cn('border border-white/10 h-[40px] flex items-center rounded-full mt-auto p-2', className)}>
					<RadixProgress.Root
						className="relative overflow-hidden bg-transparent rounded-full w-full h-full border border-white/10"
						style={{
							// Fix overflow clipping in Safari
							// https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
							transform: 'translateZ(0)',
						}}
						value={progress}
					>
						<RadixProgress.Indicator
							className="button  w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
							style={{ transform: `translateX(-${100 - progress}%)` }}
						/>
					</RadixProgress.Root>
				</div>
			</TooltipTrigger>
		</Tooltip>
	)
}
