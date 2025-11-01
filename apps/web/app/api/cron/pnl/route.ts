import { NextRequest, NextResponse } from 'next/server'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getBuyTokenIx, buildTransaction } from '@repo/rage'
import { program, connection } from '@/app/utils/setup'
import { getBotWallets } from '@/app/webhook/bot'
import { BN } from '@coral-xyz/anchor'
import { getRandomToken } from '@/app/data/get_random_token'
import { getServerEnv } from '@/app/utils/env'
import { prisma } from '@/app/utils/db'
import 'server-only'

export async function GET(req: NextRequest) {
	const { CRON_SECRET } = getServerEnv()

	const requestHeaders = new Headers(req.headers)
	const authorization = requestHeaders.get('authorization')

	console.log('authorization ', authorization)

	if (authorization !== `Bearer ${CRON_SECRET}`) {
		return NextResponse.json('💩', { status: 401 })
	}

	const user = await prisma.user.findMany({})

	for (const u of user) {
		await upsertUserPnL(u.id)
	}

	// Return a success response
	return NextResponse.json(
		{
			data: [],
		},
		{ status: 200 },
	)
}

async function upsertUserPnL(userId: string) {
	try {
		// 🧮 Compute aggregate PnL across all tokens for this signer
		const result = await prisma.tokenPnl.aggregate({
			where: { signer: userId },
			_sum: {
				bought: true,
				sold: true,
				realizedPnl: true,
			},
		})

		const bought = result._sum.bought ?? BigInt(0)
		const sold = result._sum.sold ?? BigInt(0)
		const realizedPnl = result._sum.realizedPnl ?? BigInt(0)

		const row = await prisma.userPnl.upsert({
			where: { userId },
			create: {
				userId,
				bought,
				sold,
				realizedPnl,
			},
			update: {
				bought,
				sold,
				realizedPnl,
			},
		})

		// 🧠 Format profit visually
		const pnl = realizedPnl > BigInt(0) ? `+${realizedPnl}` : `${realizedPnl}`

		console.log(
			`📈 [User PnL Updated]\n` +
				`👤 Signer: ${userId}\n` +
				`🟢 Total Bought: ${bought} lamports\n` +
				`🔴 Total Sold: ${sold} lamports\n` +
				`💰 Realized PnL: ${pnl} lamports\n` +
				`✅ Upsert successful\n`,
		)

		return row
	} catch (err) {
		console.error(`🔥 [User PnL Upsert Error] signer=${userId}`, err)
		throw err
	}
}
