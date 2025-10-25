'use server'

import { SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { initializeBondingCurveSchema } from '@/app/utils/schemas'
import { isSymbolUnique } from '@/app/data/is_symbol_unique'
import { prisma } from '@/app/utils/db'
import { Prisma } from '@prisma/client'
import { program, connection } from '@/app/utils/setup'
import { type CreateMintAccountArgs, getRageToken, getInitializeIx, buildTransaction } from '@repo/rage'
import { PublicKey } from '@solana/web3.js'
import { auth } from '@/app/auth'

import { getServerEnv } from '@/app/utils/env'
import { getUser } from '@/app/data/get_user'
import { PinataSDK } from 'pinata'
import { isInstructionError, getErrorMessage } from '@/app/utils/setup'
import sharp from 'sharp'
import * as ThumbHash from 'thumbhash'

const { PINATA_JWT, PROXY_PRIVATE_KEY } = getServerEnv()

const pinata = new PinataSDK({
	pinataJwt: PINATA_JWT,
	pinataGateway: 'indigo-adverse-vicuna-777.mypinata.cloud',
})

export type State =
	| (SubmissionResult<string[]> & {
			serializedTx?: Uint8Array
			errMessage?: string
			requestId?: string
	  })
	| undefined

export async function initializeAction(_prevState: State, formData: FormData) {
	const requestId = crypto.randomUUID()
	const session = await auth()

	if (!session) {
		console.error('no user session')

		return
	}

	const submission = await parseWithZod(formData, {
		schema: control =>
			// create a zod schema base on the control
			initializeBondingCurveSchema(control, {
				async isSymbolUnique(symbol) {
					const isUnique = await isSymbolUnique(symbol)
					return isUnique
				},
			}),
		async: true,
	})

	if (submission.status !== 'success') {
		return {
			...submission.reply(),
			serializedTx: undefined,
			errMessage: undefined,
			requestId,
		}
	}

	const { file, name, symbol, description, creator } = submission.value

	const decimals = 6

	if (creator.toBase58() !== session.user?.id) {
		return
	}

	const upload = await pinata.upload.public.file(file)

	const image = `https://indigo-adverse-vicuna-777.mypinata.cloud/ipfs/${upload.cid}`

	const imageBuffer = await fetchImage(image)

	const thumbhash = await generateThumbHash(imageBuffer)

	await getUser(creator.toBase58())

	const mint = getRageToken({ program, tokenSymbol: symbol })

	await uploadMetadata({
		creator,
		mint,
		name,
		symbol,
		image,
		thumbhash,
		description,
	})

	const json = await pinata.upload.public.json({
		name,
		symbol,
		description,
		image,
	})

	const uri = `https://indigo-adverse-vicuna-777.mypinata.cloud/ipfs/${json.cid}`

	const args: CreateMintAccountArgs = {
		name,
		symbol,
		uri,
	}

	const payer = creator

	const ix = await getInitializeIx({
		program,
		payer,

		decimals,
		args,
	})

	const tx = await buildTransaction({
		connection,
		payer,
		instructions: [...ix],
		signers: [],
	})

	const sim = await connection.simulateTransaction(tx)

	if (sim.value.err !== null && !isInstructionError(sim.value.err)) {
		return {
			...submission.reply(),
			serializedTx: undefined,
			errMessage: 'unknown error',
			requestId,
		}
	} else if (sim.value.err !== null && isInstructionError(sim.value.err)) {
		const code = sim.value.err.InstructionError[1].Custom
		const errMessage = getErrorMessage(code)

		return {
			...submission.reply(),
			serializedTx: undefined,
			errMessage,
			requestId,
		}
	}

	return {
		...submission.reply(),
		serializedTx: tx.serialize(),
		errMessage: undefined,
		requestId,
	}
}

interface UploadMetadataParams {
	creator: PublicKey
	mint: PublicKey
	name: string
	symbol: string
	image: string
	thumbhash: Buffer
	description: string
}

export async function uploadMetadata({
	creator,
	mint,
	name,
	symbol,
	image,
	thumbhash,
	description,
}: UploadMetadataParams) {
	const tokenId = mint.toBase58()

	const data = Prisma.validator<Prisma.TokenCreateInput>()({
		id: tokenId,

		metadata: {
			create: {
				name,
				symbol,
				image,
				thumbhash,
				description,
			},
		},

		creator: { connect: { id: creator.toBase58() } },
	})

	const token = await prisma.token.create({
		data,
	})

	return token
}

export async function generateThumbHash(imageBuffer: Buffer) {
	const { data, info } = await sharp(imageBuffer)
		.resize(100, 100, { fit: 'inside' })
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true })

	const binaryThumbHash = ThumbHash.rgbaToThumbHash(info.width, info.height, data)
	return Buffer.from(binaryThumbHash)
}

export async function fetchImage(url: string): Promise<Buffer> {
	const response = await fetch(url)

	return Buffer.from(await response.arrayBuffer())
}

async function deleteToken(mint: PublicKey, creatorId: string) {
	const tokenId = mint.toBase58()
	const token = await prisma.token.findUniqueOrThrow({ where: { id: tokenId } })

	if (token.creatorId !== creatorId) {
		console.warn(`Unauthorized delete attempt for ${tokenId}`)
		return
	}
	// if you add a status field, also guard: if (token.status !== 'Draft') return
	await prisma.metadata.deleteMany({ where: { tokenId } })
	await prisma.token.delete({ where: { id: tokenId } })
}
