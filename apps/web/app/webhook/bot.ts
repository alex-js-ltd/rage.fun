import { Keypair, PublicKey } from '@solana/web3.js'
import { getSigner } from '@/app/utils/misc'
import { prisma } from '@/app/utils/db'
import { Prisma, SwapType, SwapEvent } from '@prisma/client'
import bs58 from 'bs58'
import { getWallet } from '../data/get_wallet'

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

export async function getBotWallets() {
	const botWallets = await prisma.botWallet.findMany()

	const promise = botWallets.map(async b => {
		const arr = b.secretKey as number[]

		const keypair = Keypair.fromSecretKey(new Uint8Array(arr))

		const wallet = await getWallet(keypair.publicKey)

		return { keypair, wallet }
	})

	const data = await Promise.all(promise)

	return data.filter(bot => bot.wallet.length > 0)
}
