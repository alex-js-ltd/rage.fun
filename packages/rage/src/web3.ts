import { Rage } from '../target/types/rage'
import {
	type Signer,
	type TransactionInstruction,
	type Connection,
	PublicKey,
	TransactionMessage,
	VersionedTransaction,
	LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { Program, BN, web3, EventParser, BorshCoder, IdlEvents } from '@coral-xyz/anchor'
import Decimal from 'decimal.js'

export async function airDrop({ account, connection }: { account: PublicKey; connection: Connection }) {
	const amount = 1000 * LAMPORTS_PER_SOL
	const blocks = connection.getLatestBlockhash()
	const airDrop = connection.requestAirdrop(account, amount)

	const [latestBlockhash, signature] = await Promise.all([blocks, airDrop])

	await connection.confirmTransaction(
		{
			...latestBlockhash,
			signature,
		},
		'confirmed',
	)
}

export async function buildTransaction({
	connection,
	payer,
	signers,
	instructions,
}: {
	connection: Connection
	payer: PublicKey
	signers: Signer[]
	instructions: TransactionInstruction[]
}): Promise<VersionedTransaction> {
	const { blockhash } = await connection.getLatestBlockhash()

	const messageV0 = new TransactionMessage({
		payerKey: payer,
		recentBlockhash: blockhash,
		instructions,
	}).compileToV0Message()

	const tx = new VersionedTransaction(messageV0)

	signers.forEach(s => tx.sign([s]))

	return tx
}

export async function sendAndConfirm({ connection, tx }: { connection: Connection; tx: VersionedTransaction }) {
	const blocks = connection.getLatestBlockhash()
	const send = connection.sendTransaction(tx)

	const [latestBlockhash, signature] = await Promise.all([blocks, send])

	await connection.confirmTransaction(
		{
			...latestBlockhash,
			signature,
		},
		'confirmed',
	)

	return signature
}

export async function isRentExempt({ connection, address }: { connection: Connection; address: PublicKey }) {
	const accountInfo = await connection.getAccountInfo(address)

	if (accountInfo === null) {
		throw new Error('Account not found')
	}

	const minRent = await connection.getMinimumBalanceForRentExemption(accountInfo.data.length)
	return accountInfo.lamports >= minRent
}

export function uiAmountToAmount(amount: number | string, decimals: number): BN {
	const scale = new Decimal(amount).mul(10 ** decimals).toFixed(0)
	return new BN(scale)
}

export function amountToUiAmount(amount: BN, decimals: number): string {
	const divisor = new BN(10).pow(new BN(decimals))
	const uiAmount = amount.div(divisor)
	return uiAmount.toString()
}

export function bigintToUiAmount(amount: bigint, decimals: number): string {
	const divisor = BigInt(10 ** decimals)
	const integerPart = amount / divisor
	const fractionalPart = amount % divisor

	// Convert the fractional part to a string, padded with leading zeros if necessary
	const fractionalStr = fractionalPart.toString().padStart(decimals, '0')

	// Combine the integer part and fractional part
	const uiAmount = `${integerPart.toString()}.${fractionalStr}`

	return uiAmount
}

export function fromLamports(lamportsAmount: BN, decimals: number): number {
	return new Decimal(lamportsAmount.toString())
		.div(10 ** decimals)
		.toDP(decimals, Decimal.ROUND_DOWN)
		.toNumber()
}
