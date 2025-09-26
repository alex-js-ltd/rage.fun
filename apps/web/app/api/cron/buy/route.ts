import { NextRequest, NextResponse } from 'next/server'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getBuyTokenIx, buildTransaction } from '@repo/rage'
import { program, connection } from '@/app/utils/setup'
import { getBotWallets } from '@/app/webhook/bot'
import { BN } from '@coral-xyz/anchor'
import { getRandomToken } from '@/app/data/get_random_token'
import 'server-only'

export async function GET(req: NextRequest) {
	const bots = await getBotWallets()

	const randomIndex = Math.floor(Math.random() * bots.length)
	const chosen = bots[randomIndex]

	const signer = chosen.keypair
	const payer = chosen.keypair.publicKey

	const token = await getRandomToken()
	const mint = new PublicKey(token.id)

	const uiAmount = await getUiAmountForBuy(payer)
	const decimals = 9

	const ix = await getBuyTokenIx({
		program,
		payer,
		mint,
		uiAmount,
		decimals,
		minOutput: new BN(0),
	})

	const tx = await buildTransaction({
		connection,
		payer,
		instructions: [ix],
		signers: [],
	})

	tx.sign([signer])

	const sig = await connection.sendTransaction(tx)

	console.log(`🔗 Transaction sig: ${sig} for buy instruction`)

	// Return a success response
	return NextResponse.json(
		{
			data: [],
		},
		{ status: 200 },
	)
}

async function getUiAmountForBuy(wallet: PublicKey) {
	const lamports = await connection.getBalance(wallet)

	// fractions we allow
	const fractions = [0.1, 0.25, 0.5, 0.125] // 10%, 25%, 50%, 12.5%

	// pick one at random
	const randomFraction = fractions[Math.floor(Math.random() * fractions.length)]

	// apply it
	const portion = Math.floor(lamports * randomFraction)

	// convert to SOL (UI amount)
	const uiAmount = portion / LAMPORTS_PER_SOL

	return uiAmount.toFixed(9)
}
