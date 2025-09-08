import { Keypair, PublicKey } from '@solana/web3.js'
import { getSigner } from '@/app/utils/misc'
import { prisma } from '@/app/utils/db'
import { Prisma, SwapType, SwapEvent } from '@prisma/client'

function keypairToSecretKeyArray(keypair: Keypair) {
	return Array.from(keypair.secretKey)
}

export async function createBotWallet() {
	const keypair = Keypair.generate()
	const id = keypair.publicKey.toBase58()
	const secretKey = keypairToSecretKeyArray(keypair)

	const botWallet = await prisma.botWallet.create({
		data: { id, secretKey },
	})

	console.log(`🤖 Bot wallet created! [${botWallet.id.slice(0, 4)}…${botWallet.id.slice(-4)}] 🎉`)

	return botWallet
}

export async function getBotWallets(): Promise<Keypair[]> {
	const botWallets = await prisma.botWallet.findMany()

	return botWallets.map(b => {
		const arr = b.secretKey as number[]
		return Keypair.fromSecretKey(new Uint8Array(arr))
	})
}
