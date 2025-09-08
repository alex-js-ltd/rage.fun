import { Magicmint } from '../target/types/magicmint'
import { Program, BN, utils } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { getAccount } from '@solana/spl-token'

export function getExtraMetas({ program, mint }: { program: Program<Magicmint>; mint: PublicKey }): PublicKey {
	return PublicKey.findProgramAddressSync(
		[utils.bytes.utf8.encode('extra-account-metas'), mint.toBuffer()],
		program.programId,
	)[0]
}

// Auth
export function getMagicMintToken({
	program,
	tokenSymbol,
}: {
	program: Program<Magicmint>
	tokenSymbol: string
}): PublicKey {
	return PublicKey.findProgramAddressSync(
		[Buffer.from('magic_mint_token'), Buffer.from(tokenSymbol)],
		program.programId,
	)[0]
}
// Auth
export function getBondingCurveAuth({ program, mint }: { program: Program<Magicmint>; mint: PublicKey }): PublicKey {
	return PublicKey.findProgramAddressSync([Buffer.from('bonding_curve_auth'), mint.toBuffer()], program.programId)[0]
}

export function getAirdropAuth({ program, mint }: { program: Program<Magicmint>; mint: PublicKey }): PublicKey {
	return PublicKey.findProgramAddressSync([Buffer.from('airdrop_auth'), mint.toBuffer()], program.programId)[0]
}

export function getTradingFeeAuth({ program, mint }: { program: Program<Magicmint>; mint: PublicKey }): PublicKey {
	return PublicKey.findProgramAddressSync([Buffer.from('trading_fee_auth'), mint.toBuffer()], program.programId)[0]
}

// State

export function getBondingCurveState({ program, mint }: { program: Program<Magicmint>; mint: PublicKey }): PublicKey {
	return PublicKey.findProgramAddressSync([Buffer.from('bonding_curve_state'), mint.toBuffer()], program.programId)[0]
}

export async function fetchBondingCurveState({ program, mint }: { program: Program<Magicmint>; mint: PublicKey }) {
	const pda = getBondingCurveState({ program, mint })

	const data = await program.account.bondingCurveState.fetch(pda)

	return data
}

export type BondingCurveState = Awaited<ReturnType<typeof fetchBondingCurveState>>

export function getAirdropState({ program, mint }: { program: Program<Magicmint>; mint: PublicKey }): PublicKey {
	return PublicKey.findProgramAddressSync([Buffer.from('airdrop_state'), mint.toBuffer()], program.programId)[0]
}

export async function fetchAirdropState({ program, mint }: { program: Program<Magicmint>; mint: PublicKey }) {
	const pda = getAirdropState({ program, mint })

	const data = await program.account.airdropState.fetch(pda)

	return data
}

export async function fetchTradingFeeYield({
	program,
	mint,
	connection,
}: {
	program: Program<Magicmint>
	mint: PublicKey
	connection: Connection
}): Promise<BN> {
	const tradingFeeAuth = getTradingFeeAuth({ program, mint })

	const accountInfo = await connection.getAccountInfo(tradingFeeAuth)
	if (!accountInfo) {
		throw new Error('Trading fee vault does not exist')
	}

	const rentExempt = await connection.getMinimumBalanceForRentExemption(accountInfo.data.length)
	const usableLamports = accountInfo.lamports - rentExempt

	return new BN(Math.max(usableLamports, 0))
}

// pdas for proxy

export const POOL_AUTH_SEED = Buffer.from(utils.bytes.utf8.encode('vault_and_lp_mint_auth_seed'))

export const POOL_SEED = Buffer.from(utils.bytes.utf8.encode('pool'))

export const POOL_VAULT_SEED = Buffer.from(utils.bytes.utf8.encode('pool_vault'))

export const POOL_LPMINT_SEED = Buffer.from(utils.bytes.utf8.encode('pool_lp_mint'))

export const ORACLE_SEED = Buffer.from(utils.bytes.utf8.encode('observation'))

export function getAuthAddress({ programId }: { programId: PublicKey }) {
	return PublicKey.findProgramAddressSync([POOL_AUTH_SEED], programId)[0]
}

export function getPoolAddress({
	ammConfig,
	tokenMint0,
	tokenMint1,
	programId,
}: {
	ammConfig: PublicKey
	tokenMint0: PublicKey
	tokenMint1: PublicKey
	programId: PublicKey
}): PublicKey {
	return PublicKey.findProgramAddressSync(
		[POOL_SEED, ammConfig.toBuffer(), tokenMint0.toBuffer(), tokenMint1.toBuffer()],
		programId,
	)[0]
}

export function getPoolLpMintAddress({ pool, programId }: { pool: PublicKey; programId: PublicKey }): PublicKey {
	return PublicKey.findProgramAddressSync([POOL_LPMINT_SEED, pool.toBuffer()], programId)[0]
}

export function getPoolVaultAddress({
	pool,
	vaultTokenMint,
	programId,
}: {
	pool: PublicKey
	vaultTokenMint: PublicKey
	programId: PublicKey
}): PublicKey {
	return PublicKey.findProgramAddressSync([POOL_VAULT_SEED, pool.toBuffer(), vaultTokenMint.toBuffer()], programId)[0]
}

export function getOracleAccountAddress({ pool, programId }: { pool: PublicKey; programId: PublicKey }): PublicKey {
	return PublicKey.findProgramAddressSync([ORACLE_SEED, pool.toBuffer()], programId)[0]
}
