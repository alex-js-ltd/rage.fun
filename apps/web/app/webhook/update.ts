'use server'

import { prisma } from '@/app/utils/db'
import { Prisma, SwapType, SwapEvent } from '@prisma/client'

import { program, connection } from '@/app/utils/setup'
import { Keypair, PublicKey } from '@solana/web3.js'
import { getEnv } from '@/app/utils/env'
import {
	type Rage,
	buildTransaction,
	getSyncBondingCurveIx,
	getReallocIx,
	sendAndConfirm,
	fetchBondingCurveState,
} from '@repo/rage'

import { getRandomUsers } from '@/app/data/get_random_users'
import { Program } from '@coral-xyz/anchor'

const { CLUSTER } = getEnv()

export async function syncBondingCurve({
	program,
	mint,
	payer,
}: {
	program: Program<Rage>
	payer: Keypair
	mint: PublicKey
}) {
	const ix = await getSyncBondingCurveIx({
		program,
		mint,
		payer: payer.publicKey,
	})

	const tx = await buildTransaction({
		connection,
		payer: payer.publicKey,
		instructions: [ix],
		signers: [],
	})

	tx.sign([payer])

	const send = connection.sendTransaction(tx)

	await send
}
