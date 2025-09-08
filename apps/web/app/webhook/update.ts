'use server'

import { prisma } from '@/app/utils/db'
import { Prisma, SwapType, SwapEvent } from '@prisma/client'

import { program } from '@/app/utils/setup'
import { Keypair, PublicKey } from '@solana/web3.js'
import { getEnv } from '@/app/utils/env'
import {
	type Magicmint,
	buildTransaction,
	getSyncBondingCurveIx,
	getReallocIx,
	sendAndConfirm,
	fetchBondingCurveState,
	getMigrateIx,
} from '@repo/magicmint'
import { connection } from '@/app/utils/setup'
import { getRandomUsers } from '@/app/data/get_random_users'
import { Program } from '@coral-xyz/anchor'

const { CLUSTER } = getEnv()

export async function syncBondingCurve({
	program,
	mint,
	payer,
}: {
	program: Program<Magicmint>
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

export async function realloc({
	program,
	mint,
	payer,
}: {
	program: Program<Magicmint>
	payer: Keypair
	mint: PublicKey
}) {
	const ix = await getReallocIx({
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

	const send = sendAndConfirm({ connection, tx })
	const sig = await send
}

export async function migrate({
	program,
	mint,
	payer,
}: {
	program: Program<Magicmint>
	payer: Keypair
	mint: PublicKey
}) {
	const ix = await getMigrateIx({
		program,
		mint,
		payer: payer.publicKey,
	})

	const tx = await buildTransaction({
		connection,
		payer: payer.publicKey,
		instructions: [...ix],
		signers: [],
	})

	tx.sign([payer])

	const sim = await connection.simulateTransaction(tx)

	console.log(sim)

	const send = sendAndConfirm({ connection, tx })
	const sig = await send
	console.log(`migrate sig ${sig}`)
}
