import { prisma } from '@repo/database'

export async function getDiscordId(userId?: string) {
	if (!userId) return null
	// userId here is the wallet address (since User.id is the wallet)
	const account = await prisma.account.findFirst({
		where: {
			userId,
			provider: 'discord',
		},
		select: { providerAccountId: true },
	})

	return account?.providerAccountId ?? null
}
