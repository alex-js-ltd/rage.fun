import { prisma } from '@/app/utils/db'

export async function getUserIdFromDiscord(discordId: string) {
	const account = await prisma.account.findFirst({
		where: {
			provider: 'discord',
			providerAccountId: discordId,
		},
		select: { userId: true },
	})

	console.log('account', account)

	return account?.userId ?? discordId
}
