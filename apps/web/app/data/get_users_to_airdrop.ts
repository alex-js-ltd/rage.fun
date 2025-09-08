import { prisma } from '@/app/utils/db'
import { PublicKey } from '@solana/web3.js'
import { SwapEvent } from '@prisma/client'
import 'server-only'
import { SwapEventSchema } from '../utils/schemas'

export async function getUsersToAirdrop(mint: string) {
	// Fetch swap events
	const swapEvents = await prisma.swapEvent.findMany({
		where: {
			tokenId: mint,
		},
		orderBy: [{ signer: 'asc' }, { time: 'asc' }],
	})

	const data = swapEvents.reduce<Array<{ total: bigint; signer: string; time: bigint }>>((acc, curr) => {
		const index = acc.findIndex(e => e.signer === curr.signer)

		if (index === -1 && curr.swapType === 'BUY') {
			const signer = curr.signer
			const total = curr.amount
			const time = curr.amount
			acc.push({ signer, total, time })
		} else {
			const prev = { ...acc[index] }

			acc[index].total = curr.swapType === 'BUY' ? prev.total + curr.amount : prev.total - curr.amount
			acc[index].time = curr.swapType === 'BUY' ? prev.time : curr.time
		}

		return acc
	}, [])
}
