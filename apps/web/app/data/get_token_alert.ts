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
		},
	},

	bondingCurve: {
		select: { currentSupply: true, currentReserve: true, decimals: true, targetReserve: true },
	},
})

type TokenPayload = Prisma.TokenGetPayload<{
	select: typeof select
}>

function getBondingCurve(bondingCurve: NonNullable<TokenPayload['bondingCurve']>) {
	return {
		progress: calculatePercentage(bondingCurve.currentReserve, bondingCurve.targetReserve),
		currentReserve: bondingCurve.currentReserve.toString(),
		currentSupply: bondingCurve.currentSupply.toString(),
		decimals: bondingCurve.decimals,
	}
}

function toAlert(token: TokenPayload) {
	if (!token.metadata || !token.bondingCurve) {
		throw new Error('Missing required relations')
	}

	const { id, metadata, bondingCurve } = token

	return { id, metadata, bondingCurve: getBondingCurve(bondingCurve) }
}

export const getTokenAlert = cache(async (mint: string) => {
	const token = await prisma.token.findUniqueOrThrow({
		where: { id: mint },
		select,
	})

	return toAlert(token)
})

export type TokenAlert = ReturnType<typeof toAlert>

function calculatePercentage(current: bigint, target: bigint) {
	return new Decimal(current.toString()).div(target.toString()).mul(100).toNumber()
}
