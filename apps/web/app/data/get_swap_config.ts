import { cache } from 'react'
import { prisma, selectSwapConfig as select } from '@repo/database'
import type { SwapConfigRow } from '@repo/database'
import { calculatePercentage } from '@/app/utils/misc'
import 'server-only'

export const getSwapConfig = cache(async (mint: string) => {
	const token = await prisma.token.findUniqueOrThrow({
		where: { id: mint },
		select,
	})

	return toSwapConfig(token)
})

function toSwapConfig(token: SwapConfigRow) {
	if (!token.metadata || !token.bondingCurve) {
		throw new Error('Missing required relations')
	}

	const { id, metadata, bondingCurve } = token

	return {
		id,
		metadata: { ...metadata, thumbhash: Buffer.from(metadata.thumbhash).toString('base64') },
		bondingCurve: {
			// reserves (BigInt -> string)
			virtualReserve: bondingCurve.virtualReserve.toString(),
			currentReserve: bondingCurve.currentReserve.toString(),
			targetReserve: bondingCurve.targetReserve.toString(),

			// supplies (BigInt -> string)
			virtualSupply: bondingCurve.virtualSupply.toString(),
			currentSupply: bondingCurve.currentSupply.toString(),
			targetSupply: bondingCurve.targetSupply.toString(),

			// scalar fields (keep as-is; adjust if yours are Decimal)
			connectorWeight: bondingCurve.connectorWeight.toNumber(), // or .toString() if Decimal
			decimals: bondingCurve.decimals,

			progress: calculatePercentage(bondingCurve.currentReserve, bondingCurve.targetReserve),
		},
	}
}

export type SwapConfig = ReturnType<typeof toSwapConfig>
