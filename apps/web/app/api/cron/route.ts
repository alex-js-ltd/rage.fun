import { NextRequest, NextResponse } from 'next/server'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getSellTokenIx, getBuyTokenIx, buildTransaction, sendAndConfirm } from '@repo/rage'
import { program, connection } from '@/app/utils/setup'
import { getBotWallets } from '@/app/webhook/bot'
import { BN } from '@coral-xyz/anchor'
import { getRandomToken } from '@/app/data/get_random_token'

import 'server-only'

export async function POST(req: NextRequest) {
	const bots = await getBotWallets()

	const randomIndex = Math.floor(Math.random() * bots.length)
	const chosen = bots[randomIndex]

	const signer = chosen.keypair
	const payer = chosen.keypair.publicKey

	for (const w of chosen.wallet) {
		const mint = new PublicKey(w.mint)
		const uiAmount = w.tokenAmount.uiAmountString
		const decimals = w.tokenAmount.decimals

		const ix = await getSellTokenIx({
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

		const sig = await sendAndConfirm({ connection, tx })
		console.log(`🔗 Transaction sig: ${sig} for sell instruction`)
	}

	const token = await getRandomToken()
	const mint = new PublicKey(token.id)

	const uiAmount = await getUiAmount(payer)
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

	const sig = await sendAndConfirm({ connection, tx })

	console.log(`🔗 Transaction sig: ${sig} for buy instruction`)

	// Return a success response
	return NextResponse.json(
		{
			data: [],
		},
		{ status: 200 },
	)
}

async function getUiAmount(wallet: PublicKey) {
	const lamports = await connection.getBalance(wallet)

	// 2) take 25%
	const quarter = Math.floor(lamports * 0.25)

	// 3) convert to SOL (UI amount)
	const uiAmount = quarter / LAMPORTS_PER_SOL

	return uiAmount.toFixed(9)
}
