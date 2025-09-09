import { prisma } from '@/app/utils/db'
import { program } from '@/app/utils/setup'
import { getBondingCurveState } from '@repo/rage'
import { PublicKey } from '@solana/web3.js'
import { unstable_cache } from 'next/cache'
import 'server-only'

export async function getDecimals(mint: string): Promise<number> {
	const pda = getBondingCurveState({ program, mint: new PublicKey(mint) })
	const id = pda.toBase58()

	const curve = await prisma.bondingCurve.findUniqueOrThrow({
		where: { id },
		select: { decimals: true },
	})

	return curve.decimals
}

export function getCachedDecimals(mint: string) {
	return unstable_cache(
		async () => {
			return await getDecimals(mint)
		},
		[mint], // add mint to the cache key
		{
			tags: [`decimals-${mint}`],
		},
	)()
}
