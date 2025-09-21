import { PublicKey } from '@solana/web3.js'
import { type EventData, getBondingCurveState, fetchBondingCurveState } from '@repo/rage'
import { program } from '@/app/utils/setup'
import { prisma } from '@/app/utils/db'
import { Prisma, $Enums, BondingCurve } from '@prisma/client'
import { getServerEnv } from '@/app/utils/env'
import { getTokenWithRelations } from '@/app/data/get_token'
import { sendUpdateAlertToAbly } from '@/app/webhook/ably'

import { revalidateTag } from 'next/cache'
import { Decimal } from '@prisma/client/runtime/library'
import * as Ably from 'ably'
import 'server-only'

const { ABLY_API_KEY } = getServerEnv()

export async function createBondingCurve(mint: PublicKey) {
	const tokenId = mint.toBase58()
	const pda = getBondingCurveState({ program, mint })
	const id = pda.toBase58()

	const { connectorWeight, decimals, ...rest } = await fetchBondingCurveState({
		program,
		mint,
	})

	const virtualSupply = BigInt(rest.virtualSupply.toString())
	const currentSupply = BigInt(rest.currentSupply.toString())
	const targetSupply = BigInt(rest.targetSupply.toString())

	const virtualReserve = BigInt(rest.virtualReserve.toString())
	const currentReserve = BigInt(rest.currentReserve.toString())
	const targetReserve = BigInt(rest.targetReserve.toString())

	const openTime = BigInt(rest.openTime.toString())

	const tradingFees = BigInt('0')

	const status = $Enums.Status.Funding

	const create = Prisma.validator<Prisma.BondingCurveCreateArgs>()({
		data: {
			id,

			connectorWeight,
			decimals,

			virtualSupply,
			currentSupply,
			targetSupply,

			virtualReserve,
			currentReserve,
			targetReserve,

			openTime,
			tradingFees,

			status,

			token: { connect: { id: tokenId } },
		},
	})

	const data = await prisma.bondingCurve.create(create)

	return data
}

export async function createMarketData(bondingCurve: BondingCurve) {
	const tokenId = bondingCurve.tokenId

	const price = calculatePrice(bondingCurve)
	const marketCap = calculateMarketCap(price, bondingCurve)
	const liquidity = bondingCurve.currentReserve

	const volume = BigInt('0')
	const buyCount = 0
	const sellCount = 0

	const create = Prisma.validator<Prisma.MarketDataCreateArgs>()({
		data: {
			price,
			marketCap,

			liquidity,
			volume,

			buyCount,
			sellCount,

			token: { connect: { id: tokenId } },
		},
	})

	const data = await prisma.marketData.create(create)

	return data
}

export async function processCreateEvents(createEvents: EventData<'createEvent'>[]) {
	const client = new Ably.Rest(ABLY_API_KEY)
	const channel = client.channels.get('updateEvent')

	for await (const event of createEvents) {
		try {
			const curve = await createBondingCurve(event.data.mint)

			await createMarketData(curve)

			const token = await getTokenWithRelations(event.data.mint.toBase58())

			await sendUpdateAlertToAbly(channel, token, 'Create')

			revalidateTag(token.id)
		} catch (err) {
			console.error('processCreateEvents error', {
				signature: event.signature,
				mint: event.data.mint?.toBase58?.(),
				err,
			})
		}
	}
}

export function calculatePrice(state: BondingCurve) {
	const {
		currentReserve, // lamports
		virtualReserve, // lamports
		currentSupply, // base units (10^decimals)
		virtualSupply, // base units (10^decimals)
		connectorWeight, // e.g. 0.33
		decimals, // token decimals, e.g. 9
	} = state

	// Sum in base units first, then convert once.
	const reserveLamports = new Decimal(currentReserve.toString()).add(new Decimal(virtualReserve.toString()))
	const reserve = reserveLamports.div(1e9) // → SOL

	const supplyBaseUnits = new Decimal(currentSupply.toString()).add(new Decimal(virtualSupply.toString()))
	const supply = supplyBaseUnits.div(new Decimal(10).pow(decimals)) // → tokens

	const cw = new Decimal(connectorWeight)

	if (supply.lte(0) || cw.lte(0)) {
		throw new Error('Invalid state: supply and connectorWeight must be > 0')
	}

	return reserve.div(supply.mul(cw)) // Decimal
}

export function calculateMarketCap(price: Decimal, state: BondingCurve) {
	const supply = new Decimal(state.currentSupply.toString()).div(new Decimal(10).pow(state.decimals))

	return price.mul(supply)
}
