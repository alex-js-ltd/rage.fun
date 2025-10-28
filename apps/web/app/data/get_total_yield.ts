import { prisma } from '@/app/utils/db'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Decimal } from 'decimal.js'
import 'server-only'

export async function getTotalYield(mint: string) {
	// Aggregate = sum all lamports for this tokenId
	const agg = await prisma.harvestEvent.aggregate({
		where: { tokenId: mint },
		_sum: { lamports: true },
	})

	// Handle empty case
	const lamportsTotal = agg._sum.lamports ?? BigInt(0)

	// Convert lamports → SOL
	const solTotal = new Decimal(lamportsTotal.toString()).div(LAMPORTS_PER_SOL)

	return {
		tokenId: mint,
		lamports: lamportsTotal.toString(),
		sol: solTotal.toString(),
	}
}
