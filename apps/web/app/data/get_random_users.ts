import { prisma } from '@/app/utils/db'
import { PublicKey } from '@solana/web3.js'
import 'server-only'

const notIn = [
	'8jCcTyypwWUmYPsQZLT2qK3tuhvWzpU9Se4v8yadKJcv',
	'HMasTbeWmvVhKerN7fM6nfCNyqZLukzPM8tM9ri2oBCP',
	'7HxswybT8oXzJyT9zonLVnDqqGJouU7QZUy4FC5DMzDh',
]

export async function getRandomUsers(mint: string) {
	// Fetch recent buyers (accumulated lamports > 0.001 SOL)
	const recentBuyers = await prisma.swapEvent.groupBy({
		by: ['signer'],
		where: {
			tokenId: mint,
			swapType: 'BUY',
			signer: { notIn: [] },
		},
		_sum: {
			lamports: true,
		},
		having: {
			lamports: {
				_sum: {
					gt: 99_999,
				},
			},
		},
		orderBy: {
			_max: {
				time: 'desc',
			},
		},
	})

	const uniqueBuyers = getUniqueSigners([...recentBuyers.map(b => b.signer)])

	const users = uniqueBuyers.slice(0, 10)

	return users.map(signer => new PublicKey(signer))
}

function getUniqueSigners(signers: string[], limit = 5): string[] {
	const seen = new Set<string>()
	const unique: string[] = []

	for (const signer of signers) {
		if (unique.length >= limit) break
		if (!seen.has(signer)) {
			seen.add(signer)
			unique.push(signer)
		}
	}

	return unique
}
