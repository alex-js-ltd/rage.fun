import { faker } from '@faker-js/faker'
import { prisma } from '@/app/utils/db'
import { Keypair } from '@solana/web3.js'
import { getUser } from '@/app/data/get_user'
import { uploadMetadata, fetchImage, generateThumbHash } from '@/app/actions/initialize_action'
import { getRageToken } from '@repo/rage'
import { $Enums } from '@prisma/client'

async function seed() {
	console.log('🌱 Seeding...')
	console.time(`🌱 Database has been seeded`)

	console.time('🧹 Cleaned up the database...')

	await prisma.user.deleteMany()
	console.timeEnd('🧹 Cleaned up the database...')
	const payer = Keypair.generate()

	await getUser(payer.publicKey.toBase58())

	const tokens = Array.from({ length: 100 }, () => ({
		mint: Keypair.generate(),
		name: faker.lorem.word(),
		symbol: faker.person.fullName(),
		image: faker.image.url(),
		description: faker.lorem.sentence(),
	}))

	for await (const token of tokens) {
		const imageBuffer = await fetchImage(token.image)

		const thumbhash = await generateThumbHash(imageBuffer)

		await uploadMetadata({
			creator: payer.publicKey,
			mint: token.mint.publicKey,
			name: token.name,
			symbol: token.symbol,
			image: token.image,
			thumbhash,
			description: token.description,
		})

		await prisma.bondingCurve.create({
			data: {
				id: '234',

				tokenId: token.mint.publicKey.toBase58(),
				connectorWeight: 0.33,
				decimals: 6,

				initialSupply: 1000,
				currentSupply: 1000,
				targetSupply: 10000000,

				initialReserve: 1000,
				currentReserve: 1000,
				targetReserve: 10000000,

				openTime: 1000000,
				tradingFees: 0,

				status: $Enums.Status.Funding,
			},
		})
	}

	console.timeEnd(`🌱 Database has been seeded`)
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
