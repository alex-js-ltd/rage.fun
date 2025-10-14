import { NextRequest, NextResponse } from 'next/server'
import { PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js'
import { getBuyTokenIx, buildTransaction, getSellTokenIx, Rage, sendAndConfirm } from '@repo/rage'
import { program, connection } from '@/app/utils/setup'
import { getBotWallets } from '@/app/webhook/bot'
import { BN } from '@coral-xyz/anchor'
import { getRandomToken } from '@/app/data/get_random_token'
import { getServerEnv } from '@/app/utils/env'
import { Program } from '@coral-xyz/anchor'

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

	const token = await getRandomToken()

	for (const b of bots) {
		for (const t of b.wallet) {
			const mint = new PublicKey(t.mint)
			const signer = b.keypair
			const decimals = t.tokenAmount.decimals
			const uiAmount = t.tokenAmount.uiAmountString

			await sell({ program, mint, signer, uiAmount, decimals })
		}

		await buy({ program, mint: new PublicKey(token.id), signer: b.keypair })
	}

	for (const b of bots) {
		for (const t of b.wallet) {
			const mint = new PublicKey(t.mint)
			const signer = b.keypair
			const decimals = t.tokenAmount.decimals
			const uiAmount = t.tokenAmount.uiAmountString

			await sell({ program, mint, signer, uiAmount, decimals })
		}
	}

	// Return a success response
	return NextResponse.json(
		{
			success: true,
		},
		{ status: 200 },
	)
}

async function sell({
	program,
	mint,
	signer,
	uiAmount,
	decimals,
}: {
	program: Program<Rage>
	signer: Keypair
	mint: PublicKey
	uiAmount: string
	decimals: number
}) {
	const payer = signer.publicKey

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
	console.log(`🔗 Transaction sig: ${sig} for sell`)
}

async function buy({ program, mint, signer }: { program: Program<Rage>; signer: Keypair; mint: PublicKey }) {
	const payer = signer.publicKey
	const decimals = 9

	const uiAmount = await getUiAmountForBuy(mint)

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
	console.log(`🔗 Transaction sig: ${sig} for buy`)
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
