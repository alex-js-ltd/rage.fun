import { cache } from 'react'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import Decimal from 'decimal.js'
import 'server-only'

const select = Prisma.validator<Prisma.TokenSelect>()({
	id: true,

	metadata: {
		select: {
			symbol: true,
			image: true,
			thumbhash: true,
		},
	},
	bondingCurve: {
		select: {
			virtualReserve: true,
			currentReserve: true,
			targetReserve: true,
			virtualSupply: true,
			currentSupply: true,
			targetSupply: true,
			connectorWeight: true,
			decimals: true,
		},
	},
})

type TokenPayload = Prisma.TokenGetPayload<{
	select: typeof select
}>

function getMetadata(metadata: NonNullable<TokenPayload['metadata']>) {
	return { ...metadata, thumbhash: Buffer.from(metadata.thumbhash).toString('base64') }
}

function getBondingCurve(bondingCurve: NonNullable<TokenPayload['bondingCurve']>) {
	return {
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
	}
}

function toSwapConfig(token: TokenPayload) {
	if (!token.metadata || !token.bondingCurve) {
		throw new Error('Missing required relations')
	}

	const { id, metadata, bondingCurve } = token

	return { id, metadata: getMetadata(metadata), bondingCurve: getBondingCurve(bondingCurve) }
}

export const getSwapConfig = cache(async (mint: string) => {
	const token = await prisma.token.findUniqueOrThrow({
		where: { id: mint },
		select,
	})

	return toSwapConfig(token)
})

function calculatePercentage(current: bigint, target: bigint) {
	return new Decimal(current.toString()).div(target.toString()).mul(100).toNumber()
}

export type SwapConfig = ReturnType<typeof toSwapConfig>
