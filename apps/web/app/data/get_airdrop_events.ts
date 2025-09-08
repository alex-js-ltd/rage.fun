import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import 'server-only'

export async function getAirdropEvents(mint: string) {
	const query = Prisma.validator<Prisma.AirdropSignatureFindManyArgs>()({
		where: {
			tokenId: mint,
		},
		include: {
			airdropEvents: true,
		},
	})

	const airdropSignatures = await prisma.airdropSignature.findMany(query)

	const airdropEvents = airdropSignatures.flatMap(sig => sig.airdropEvents)

	return airdropEvents
}

export const dynamic = 'force-dynamic'
