import { Program, BN, web3, AnchorProvider, setProvider, workspace } from '@coral-xyz/anchor'
import { type Connection, type PublicKey, Keypair } from '@solana/web3.js'
import {
	type Rage,
	airDrop,
	getInitializeIx,
	buildTransaction,
	sendAndConfirm,
	getBuyTokenIx,
	getProxyInitIxs,
	fetchBondingCurveState,
	amountToUiAmount,
	fetchAirdropState,
	generateToken,
	getSyncBondingCurveIx,
	getReallocIx,
	getAccountsToAirdrop,
} from '../index'

describe('proxy test', () => {
	const provider = AnchorProvider.env()
	setProvider(provider)

	const program = workspace.Rage as Program<Rage>

	const connection = provider.connection

	const payer = provider.wallet

	const token = generateToken({ program })

	const buyers = Array.from({ length: 4 }, (_, index) => ({
		index: index + 1, // or just index if you want it to start from 0
		payer: Keypair.generate(),
		amount: '20.2',
	}))

	console.log(
		'buyers',
		buyers.map(b => b.payer.publicKey.toBase58()),
	)

	it('airdrop payer', async () => {
		await airDrop({
			connection,
			account: payer.publicKey,
		})
	})

	it('airdrop buyers', async () => {
		for (const buyer of buyers) {
			await airDrop({
				connection,
				account: buyer.payer.publicKey,
			})
		}
	}, 50000)

	it('init bonding curve', async () => {
		const args = { name: token.name, symbol: token.symbol, uri: token.symbol }

		const ixs = await getInitializeIx({
			program,
			payer: payer.publicKey,
			creator: payer.publicKey,
			args,
			decimals: token.decimals,
			targetReserve: '0.35',
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

		console.log('total supply:', amountToUiAmount(state.totalSupply, token.decimals))
		console.log('initial supply:', amountToUiAmount(state.initialSupply, token.decimals))

		console.log('reserve balance:', state.reserveBalance.toString())
		console.log('progress:', state.progress.toString())
		console.log('market cap:', state.marketCap.toString())

		console.log('target_supply:', state.targetSupply.toString())

		console.log('cw:', state.connectorWeight)

		const airdropState = await fetchAirdropState({ program, mint: token.mint })

		console.log('airdrop state:', airdropState)
	})

	it('realloc', async () => {
		const one = await getReallocIx({
			program,
			payer: payer.publicKey,
			mint: token.mint,
		})

		const tx = await buildTransaction({
			connection: connection,
			payer: payer.publicKey,
			instructions: [one],
			signers: [],
		})

		payer.signTransaction(tx)

		// Simulate the transaction
		const res = await connection.simulateTransaction(tx)
		console.log(res.value.logs)
		await sendAndConfirm({ connection, tx })
	})

	it('buy token', async () => {
		const one = await getBuyTokenIx({
			program,
			payer: payer.publicKey,
			mint: token.mint,
			uiAmount: '85.0',
			decimals: token.decimals,
		})

		const tx = await buildTransaction({
			connection: connection,
			payer: payer.publicKey,
			instructions: [one],
			signers: [],
		})

		payer.signTransaction(tx)

		// Simulate the transaction
		const res = await connection.simulateTransaction(tx)
		console.log(res.value.logs)
		await sendAndConfirm({ connection, tx })
	})

	it('test airdrop', async () => {
		const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

		for (const a of arr) {
			// for the airdrop
			const wallets = Array.from({ length: 5 }, () => Keypair.generate())

			const accounts = wallets.map(w => w.publicKey)

			const users = getAccountsToAirdrop({ accounts, mint: token.mint })

			const ixs = await getUnlockAirdropIxs({
				program,
				payer: payer.publicKey,
				mint: token.mint,

				users,
			})

			const tx = await buildTransaction({
				connection: connection,
				payer: payer.publicKey,
				instructions: [...ixs],
				signers: [],
			})

			payer.signTransaction(tx)

			const res = await connection.simulateTransaction(tx)
			console.log(res.value.logs)
			await sendAndConfirm({ connection, tx })

			const airdropState = await fetchAirdropState({ program, mint: token.mint })

			console.log('airdrop state:', airdropState)
		}
	}, 6000)

	// it('sync bonding curve', async () => {
	// 	const sync = await getSyncBondingCurveIx({
	// 		program,
	// 		payer: payer.publicKey,
	// 		mint: token.mint,
	// 	})

	// 	const tx = await buildTransaction({
	// 		connection: connection,
	// 		payer: payer.publicKey,
	// 		instructions: [sync],
	// 		signers: [],
	// 	})

	// 	payer.signTransaction(tx)

	// 	// Simulate the transaction
	// 	const res = await connection.simulateTransaction(tx)
	// 	console.log(res.value.logs)
	// 	await sendAndConfirm({ connection, tx })
	// })

	it('airdrop payer', async () => {
		await airDrop({
			connection,
			account: payer.publicKey,
		})
	})

	it('proxy init', async () => {
		const ixs = await getProxyInitIxs({
			program,
			cluster: 'mainnet-beta',
			mint: token.mint,
			signer: payer.publicKey,
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

		await sendAndConfirm({ connection, tx })

		const txSize = tx.serialize().length
		console.log('Transaction size in bytes:', txSize)
	})
})
