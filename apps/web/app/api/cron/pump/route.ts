import { NextRequest, NextResponse } from 'next/server'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getBuyTokenIx, buildTransaction, getSellTokenIx } from '@repo/rage'
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

	for (const b of bots) {
		for (const t of b.wallet) {
			const mint = new PublicKey(t.mint)
			const signer = b.keypair
			const payer = b.keypair.publicKey
			const decimals = t.tokenAmount.decimals
			const uiAmount = t.tokenAmount.uiAmountString

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
