'use server'

import { parseSubmission, report } from '@conform-to/react/future'
import type { SubmissionResult } from '@conform-to/react/future'

import { CreateTokenSchema } from '@/app/utils/schemas'
import { prisma } from '@repo/database'
import type { Prisma } from '@repo/database'

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

const { PINATA_JWT } = getServerEnv()

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

export async function createToken(_prevState: unknown, formData: FormData) {
	const requestId = crypto.randomUUID()
	const session = await auth()

	const submission = parseSubmission(formData)
	const result = CreateTokenSchema.safeParse(submission.payload)

	if (!result.success) {
		return {
			...report(submission, {
				error: {
					issues: result.error.issues,
				},
			}),
			serializedTx: undefined,
			errMessage: undefined,
			requestId,
		}
	}

	const { image, name, symbol, description, creator } = result.data

	const decimals = 6

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
		await deleteToken(mint, session?.user?.id)
		return {
			...report(submission, {
				reset: true,
			}),
			serializedTx: undefined,
			errMessage: 'Insufficient balance',
			requestId,
		}
	} else if (sim.value.err !== null && isInstructionError(sim.value.err)) {
		const code = sim.value.err.InstructionError[1].Custom
		const errMessage = getErrorMessage(code)
		await deleteToken(mint, session?.user?.id)

		return {
			...report(submission, {
				reset: true,
			}),
			serializedTx: undefined,
			errMessage,
			requestId,
		}
	}

	return {
		...report(submission, { reset: true }),
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
	thumbhash: Uint8Array<ArrayBuffer>
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

	const data = {
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
	} satisfies Prisma.TokenCreateInput

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

async function deleteToken(mint: PublicKey, creatorId?: string) {
	const tokenId = mint.toBase58()
	const token = await prisma.token.findUniqueOrThrow({
		where: { id: tokenId },
	})

	if (token.creatorId !== creatorId || !creatorId) {
		console.warn(`Unauthorized delete attempt for ${tokenId}`)
		return
	}
	// if you add a status field, also guard: if (token.status !== 'Draft') return
	await prisma.metadata.deleteMany({ where: { tokenId } })
	await prisma.token.delete({ where: { id: tokenId } })
}
