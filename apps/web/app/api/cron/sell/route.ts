import { NextRequest, NextResponse } from 'next/server'
import { PublicKey } from '@solana/web3.js'
import { getSellTokenIx, buildTransaction } from '@repo/rage'
import { program, connection } from '@/app/utils/setup'
import { getBotWallets } from '@/app/webhook/bot'
import { BN } from '@coral-xyz/anchor'
import 'server-only'

export async function GET(req: NextRequest) {
	const bots = await getBotWallets()

	const randomBotIndex = Math.floor(Math.random() * bots.length)
	const chosenBot = bots[randomBotIndex]

	const signer = chosenBot.keypair
	const payer = chosenBot.keypair.publicKey

	const randomTokenIndex = Math.floor(Math.random() * chosenBot.wallet.length)
	const chosenToken = chosenBot.wallet[randomTokenIndex]

	const mint = new PublicKey(chosenToken.mint)
	const decimals = chosenToken.tokenAmount.decimals
	const uiAmount = getUiAmountForSell(chosenToken.tokenAmount.uiAmountString, decimals)

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

	const sig = await connection.sendTransaction(tx)
	console.log(`🔗 Transaction sig: ${sig} for sell instruction`)

	// Return a success response
	return NextResponse.json(
		{
			data: [],
		},
		{ status: 200 },
	)
}

function getUiAmountForSell(one: string, decimals: number) {
	const whole = Number(one)
	const half = Number(one) / 2
	const quarter = Number(one) / 4

	// fractions we allow
	const fractions = [whole, half, quarter] // 10%, 25%, 50%, 12.5%

	// pick one at random
	const randomFraction = fractions[Math.floor(Math.random() * fractions.length)]

	const uiAmount = randomFraction

	return uiAmount.toFixed(decimals)
}
