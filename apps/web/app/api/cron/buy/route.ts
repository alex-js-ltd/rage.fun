import { NextRequest, NextResponse } from 'next/server'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getBuyTokenIx, buildTransaction } from '@repo/rage'
import { program, connection } from '@/app/utils/setup'
import { getBotWallets } from '@/app/webhook/bot'
import { BN } from '@coral-xyz/anchor'
import { getRandomToken } from '@/app/data/get_random_token'
import { getServerEnv } from '@/app/utils/env'
import 'server-only'

export async function GET(req: NextRequest) {
	const { CRON_SECRET } = getServerEnv()

	const requestHeaders = new Headers(req.headers)
	const authorization = requestHeaders.get('authorization')

	console.log('authorization ', authorization)

	if (authorization !== `Bearer ${CRON_SECRET}`) {
		return NextResponse.json('💩', { status: 401 })
	}

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

	const randomFraction = 0.01 + Math.random() * 0.6 // 1%–60%

	const portion = Math.floor(lamports * randomFraction)
	const uiAmount = portion / LAMPORTS_PER_SOL

	return uiAmount.toFixed(9)
}
