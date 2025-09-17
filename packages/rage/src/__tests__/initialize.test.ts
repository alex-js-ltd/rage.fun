import { Program, BN, web3, AnchorProvider, setProvider, workspace } from '@coral-xyz/anchor'
import { type Connection, type PublicKey, Keypair } from '@solana/web3.js'
import {
	type Rage,
	airDrop,
	buildTransaction,
	sendAndConfirm,
	getBondingCurveState,
	getBuyTokenIx,
	getSellTokenIx,
	fetchBondingCurveState,
	isRentExempt,
	SOL,
	amountToUiAmount,
	bigintToUiAmount,
	getAccountsToAirdrop,
	getInitializeIx,
	getBondingCurveAuth,
	getHarvestYieldIx,
	getRageToken,
	generateToken,
	calculateProgress,
	fromLamports,
	calculatePrice,
} from '../index'
import { TOKEN_2022_PROGRAM_ID, getMint, getAssociatedTokenAddress, getAccount } from '@solana/spl-token'

describe('Launch', () => {
	const provider = AnchorProvider.env()
	setProvider(provider)

	const program = workspace.Rage as Program<Rage>

	const connection = provider.connection

	const payer = provider.wallet

	console.log(payer.publicKey.toBase58())

	const token = generateToken({ program })

	const bondingCurveAuth = getBondingCurveAuth({
		program,
		mint: token.mint,
	})

	const bondingCurveState = getBondingCurveState({
		program,
		mint: token.mint,
	})

	// for the airdrop
	const newUsers = Array.from({ length: 5 }, () => Keypair.generate())

	it('airdrop payer', async () => {
		await airDrop({
			connection,
			account: payer.publicKey,
		})
	})

	it('init bonding curve', async () => {
		const args = { name: token.name, symbol: token.symbol, uri: token.symbol }

		const ixs = await getInitializeIx({
			program,
			payer: payer.publicKey,

			args,
			decimals: token.decimals,
		})

		const tx = await buildTransaction({
			connection: connection,
			payer: payer.publicKey,
			instructions: [...ixs],
			signers: [],
		})

		// tx.sign([payer])

		payer.signTransaction(tx)

		const res = await connection.simulateTransaction(tx)
		console.log(res.value.logs)

		expect(res.value.err).toBeNull()

		await sendAndConfirm({ connection, tx })

		const txSize = tx.serialize().length
		console.log('Transaction size in bytes:', txSize)

		const state = await fetchBondingCurveState({ program, mint: token.mint })
		console.log('initial supply:', amountToUiAmount(state.virtualSupply, token.decimals))
		console.log('current supply:', amountToUiAmount(state.currentSupply, token.decimals))
		console.log('target_supply:', state.targetSupply.toString())

		console.log('current reserve:', state.currentReserve.toString())

		console.log('cw:', state.connectorWeight)

		const price = calculatePrice(state)

		console.log('start price', price.toString())
	})

	it('check bonding curve mint authority is rent exempt', async () => {
		const rentExempt = await isRentExempt({
			connection: connection,
			address: bondingCurveAuth,
		})
		expect(rentExempt).toBe(true)
	})

	it('check bonding curve auth is mint authority', async () => {
		await checkMintAuth({
			connection,
			mint: token.mint,
			vault: bondingCurveAuth,
		})
	})

	it('buy token', async () => {
		const arr1 = ['1.0']

		const arr2 = ['10.0', '10.0', '10.0', '10.0', '10.0', '10.0', '10.0']

		for (const a of arr2) {
			const one = await getBuyTokenIx({
				program,
				payer: payer.publicKey,
				mint: token.mint,
				uiAmount: a,
				decimals: token.decimals,

				minOutput: new BN(0),
			})

			const tx = await buildTransaction({
				connection: connection,
				payer: payer.publicKey,
				instructions: [one],
				signers: [],
			})

			// tx.sign([payer])

			payer.signTransaction(tx)

			// Simulate the transaction
			const res = await connection.simulateTransaction(tx)
			console.log(res.value.logs)
			await sendAndConfirm({ connection, tx })

			const state = await fetchBondingCurveState({ program, mint: token.mint })

			console.log('virtual supply:', amountToUiAmount(state.virtualSupply, token.decimals))
			console.log('current supply:', amountToUiAmount(state.currentSupply, token.decimals))
			console.log('target_supply:', state.targetSupply.toString())

			console.log('current reserve:', state.currentReserve.toString())

			console.log('cw:', state.connectorWeight)

			console.log('status:', state.status)

			const p = calculateProgress(state)

			console.log('p', p)

			const mint = await getMint(connection, token.mint, 'confirmed', TOKEN_2022_PROGRAM_ID)

			console.log(mint)

			console.log(mint.supply.toString())

			console.log('on chain supply', fromLamports(new BN(mint.supply.toString()), token.decimals))
		}
	}, 50000)

	it('sell all tokens', async () => {
		const payerAta = await getAssociatedTokenAddress(token.mint, payer.publicKey, true, TOKEN_2022_PROGRAM_ID)

		const account = await getAccount(connection, payerAta, 'confirmed', TOKEN_2022_PROGRAM_ID)

		const uiAmount = bigintToUiAmount(account.amount, token.decimals)

		const ix = await getSellTokenIx({
			program,
			payer: payer.publicKey,
			mint: token.mint,
			uiAmount: uiAmount,
			decimals: token.decimals,
			minOutput: new BN(0),
		})

		const tx = await buildTransaction({
			connection: connection,
			payer: payer.publicKey,
			instructions: [ix],
			signers: [],
		})

		// tx.sign([payer])

		payer.signTransaction(tx)

		// Simulate the transaction
		const res = await connection.simulateTransaction(tx)
		console.log(res.value.logs)
		await sendAndConfirm({ connection, tx })

		const state = await fetchBondingCurveState({ program, mint: token.mint })
		console.log('current supply:', state.currentSupply.toString())
		console.log('reserve balance:', state.currentReserve.toString())
	})

	// it('user should have 0 tokens', async () => {
	// 	const payerAta = await getAssociatedTokenAddress(token.mint, payer.publicKey, true, TOKEN_2022_PROGRAM_ID)

	// 	const account = await getAccount(connection, payerAta, 'confirmed', TOKEN_2022_PROGRAM_ID)

	// 	const state = await fetchBondingCurveState({ program, mint: token.mint })

	// 	console.log(account)

	// 	// expect(account.amount).toEqual(BigInt('0'))
	// })

	it('harvest yield', async () => {
		const ix = await getHarvestYieldIx({
			program,
			creator: payer.publicKey,
			mint: token.mint,
		})

		const tx = await buildTransaction({
			connection: connection,
			payer: payer.publicKey,
			instructions: [ix],
			signers: [],
		})

		// tx.sign([payer])

		payer.signTransaction(tx)

		// Simulate the transaction
		const res = await connection.simulateTransaction(tx)
		console.log(res.value.logs)
		await sendAndConfirm({ connection, tx })
	})
})

async function checkMintAuth({
	connection,
	mint,
	vault,
}: {
	connection: Connection
	mint: PublicKey
	vault: PublicKey
}) {
	const account = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID)

	expect(account.mintAuthority?.toBase58()).toBe(vault?.toBase58())
}
