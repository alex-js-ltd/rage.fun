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
	generateToken,
	getSyncBondingCurveIx,
	getAccountsToAirdrop,
	fromLamports,
} from '../index'

import { TOKEN_2022_PROGRAM_ID, getMint, getAssociatedTokenAddress, getAccount } from '@solana/spl-token'

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
	})

	it('buy token', async () => {
		const one = await getBuyTokenIx({
			program,
			payer: payer.publicKey,
			mint: token.mint,
			uiAmount: '80.9',
			decimals: token.decimals,
			minOutput: new BN(0),
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

		const mint = await getMint(connection, token.mint, 'confirmed', TOKEN_2022_PROGRAM_ID)

		console.log(mint)

		console.log(mint.supply.toString())

		console.log(fromLamports(new BN(mint.supply.toString()), token.decimals))
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

		const state = await fetchBondingCurveState({ program, mint: token.mint })

		console.log(state)

		console.log(state.currentSupply.toString())
	})
})
