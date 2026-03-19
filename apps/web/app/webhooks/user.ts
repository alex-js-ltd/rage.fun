import { prisma } from '@repo/database'
import { getRageWallet } from '@/app/data/get_rage_wallet'
import { calculateSellPrice } from '@/app/utils/wasm'
import { getSwapConfig } from '@/app/data/get_swap_config'

export async function upsertUserPnL(userId: string) {
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

		const position = await getUserPosition(userId)

		const row = await prisma.userPnl.upsert({
			where: { userId },
			create: {
				userId,
				bought,
				sold,
				realizedPnl,
				position,
			},
			update: {
				bought,
				sold,
				realizedPnl,
				position,
			},
		})

		console.log(
			`📈 [User PnL Updated]\n` +
				`👤 Signer: ${userId}\n` +
				`🟢 Total Bought: ${row.bought} lamports\n` +
				`🔴 Total Sold: ${row.sold} lamports\n` +
				`💰 Realized PnL: ${row.realizedPnl} lamports\n` +
				`📊 Position: ${row?.position} lamports\n` +
				`✅ Upsert successful\n`,
		)

		return row
	} catch (err) {
		console.error(`🔥 [User PnL Upsert Error] signer=${userId}`, err)
		throw err
	}
}

export async function getUserPosition(userId: string) {
	console.log(`📦 [getUserPosition] userId=${userId}`)

	const wallet = await getRageWallet(userId)
	console.log('👛 wallet:', wallet)

	const entries = Object.entries(wallet)
	console.log('📊 entries:', entries.length)

	const results = await Promise.all(
		entries.map(async ([mint, tokenAmount]) => {
			try {
				console.log(`🔄 processing mint=${mint}`)

				const { bondingCurve } = await getSwapConfig(mint)

				console.log('📈 bondingCurve:', bondingCurve)

				const position = await calculateSellPrice({
					uiAmount: tokenAmount.uiAmountString,
					...bondingCurve,
				})

				console.log(`💵 position for ${mint}:`, position)

				return Number(position)
			} catch (err) {
				console.error(`❌ failed mint=${mint}`, err)
				return 0 // don't crash whole thing
			}
		}),
	)

	const total = results.reduce((acc, pos) => acc + pos, 0)

	console.log('🧮 total position:', total)

	return total
}
