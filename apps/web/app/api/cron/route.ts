import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/utils/db'
import { MetadataSchema } from '@/app/utils/schemas'
import { unstable_cache } from 'next/cache'

import { PublicKey } from '@solana/web3.js'
import { fetchBondingCurveState, getSellTokenIx, buildTransaction, sendAndConfirm } from '@repo/rage'
import { program, connection } from '@/app/utils/setup'
import { getBotWallets } from '@/app/webhook/bot'
import { BN } from '@coral-xyz/anchor'

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
		console.log(`🔗 Transaction sig: ${sig} for sell incstruction`)
	}

	// Return a success response
	return NextResponse.json(
		{
			data: [],
		},
		{ status: 200 },
	)
}
