import { prisma } from '@/app/utils/db'

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
