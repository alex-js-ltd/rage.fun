import { Rage } from '../target/types/rage'
import { Program, BN, web3, EventParser, BorshCoder, IdlEvents } from '@coral-xyz/anchor'
import { type Connection, PublicKey, ComputeBudgetProgram, Keypair } from '@solana/web3.js'
import {
	TOKEN_2022_PROGRAM_ID,
	TOKEN_PROGRAM_ID,
	ASSOCIATED_TOKEN_PROGRAM_ID,
	getAssociatedTokenAddress,
	NATIVE_MINT,
	getAssociatedTokenAddressSync,
	getAccount,
} from '@solana/spl-token'
import { TokenMetadata } from '@solana/spl-token-metadata'
import {
	type CLUSTER,
	getExtraMetas,
	getBondingCurveState,
	uiAmountToAmount,
	sortTokens,
	getAuthAddress,
	getPoolAddress,
	getPoolLpMintAddress,
	getPoolVaultAddress,
	getOracleAccountAddress,
	getCPMMConfig,
	fetchBondingCurveState,
	isRentExempt,
	getBondingCurveAuth,
	getAirdropAuth,
	getTradingFeeAuth,
	getRageToken,
} from './index'

interface SwapTokenIxsParams {
	program: Program<Rage>
	payer: PublicKey
	mint: PublicKey
	uiAmount: string
	decimals: number
}

export async function getBuyTokenIx({ program, payer, mint, uiAmount, decimals }: SwapTokenIxsParams) {
	const token0PayerAta = await getAssociatedTokenAddress(mint, payer, true, TOKEN_2022_PROGRAM_ID)

	const tradingFeeAuth = getTradingFeeAuth({ program, mint })

	const amount = uiAmountToAmount(uiAmount, decimals)

	const bondingCurveAuth = getBondingCurveAuth({ program, mint })

	const bondingCurveState = getBondingCurveState({
		program,
		mint,
	})

	const buy = await program.methods
		.buyToken(amount)
		.accountsStrict({
			payer,
			token0Mint: mint,

			tradingFeeAuth,
			token0PayerAta,

			bondingCurveAuth,

			bondingCurveState,

			systemProgram: web3.SystemProgram.programId,
			associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			token0Program: TOKEN_2022_PROGRAM_ID,
		})
		.instruction()

	return buy
}

export async function getSellTokenIx({ program, payer, mint, uiAmount, decimals }: SwapTokenIxsParams) {
	const token0SellerAta = await getAssociatedTokenAddress(mint, payer, true, TOKEN_2022_PROGRAM_ID)

	const tradingFeeAuth = getTradingFeeAuth({ program, mint })

	const amount = uiAmountToAmount(uiAmount, decimals)

	const bondingCurveAuth = getBondingCurveAuth({ program, mint })
	// const token0BondingCurveAta = await getAssociatedTokenAddress(mint, bondingCurveAuth, true, TOKEN_2022_PROGRAM_ID)
	const bondingCurveState = getBondingCurveState({
		program,
		mint,
	})

	const sell = await program.methods
		.sellToken(amount)
		.accountsStrict({
			signer: payer,
			token0Mint: mint,

			bondingCurveAuth,

			bondingCurveState,

			tradingFeeAuth,
			token0SellerAta,

			systemProgram: web3.SystemProgram.programId,
			associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			token0Program: TOKEN_2022_PROGRAM_ID,
		})
		.instruction()

	return sell
}

export interface GetProxyInitIxsParams {
	program: Program<Rage>
	cluster: CLUSTER
	mint: PublicKey
	signer: PublicKey
}

export async function getProxyInitIxs({ program, cluster, mint, signer }: GetProxyInitIxsParams) {
	const { cpSwapProgram, configAddress, createPoolFee } = getCPMMConfig(cluster)

	const creator = getBondingCurveAuth({ program, mint })

	const bondingCurveState = getBondingCurveState({ program, mint })

	const tokens = [
		{ mint: mint, program: TOKEN_2022_PROGRAM_ID },
		{ mint: NATIVE_MINT, program: TOKEN_PROGRAM_ID },
	]

	const [token0, token1] = sortTokens(tokens)

	const auth = getAuthAddress({ programId: cpSwapProgram })

	const poolAddress = getPoolAddress({
		ammConfig: configAddress,
		tokenMint0: token0.mint,
		tokenMint1: token1.mint,
		programId: cpSwapProgram,
	})

	const lpMintAddress = getPoolLpMintAddress({
		pool: poolAddress,
		programId: cpSwapProgram,
	})

	const vault0 = getPoolVaultAddress({
		pool: poolAddress,
		vaultTokenMint: token0.mint,
		programId: cpSwapProgram,
	})
	const vault1 = getPoolVaultAddress({
		pool: poolAddress,
		vaultTokenMint: token1.mint,
		programId: cpSwapProgram,
	})
	const [creatorLpTokenAddress] = PublicKey.findProgramAddressSync(
		[creator.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), lpMintAddress.toBuffer()],
		ASSOCIATED_TOKEN_PROGRAM_ID,
	)

	const observationAddress = getOracleAccountAddress({
		pool: poolAddress,
		programId: cpSwapProgram,
	})

	const creatorToken0 = getAssociatedTokenAddressSync(token0.mint, creator, true, token0.program)
	const creatorToken1 = getAssociatedTokenAddressSync(token1.mint, creator, true, token1.program)

	const computeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({
		units: 400000,
	})

	const proxyInitIx = await program.methods
		.proxyInitialize(new BN(0))
		.accountsStrict({
			signer,
			cpSwapProgram: cpSwapProgram,
			creator,
			bondingCurveState,
			ammConfig: configAddress,
			authority: auth,
			poolState: poolAddress,
			token0Mint: token0.mint,
			token1Mint: token1.mint,
			lpMint: lpMintAddress,
			creatorToken0,
			creatorToken1,
			creatorLpToken: creatorLpTokenAddress,
			token0Vault: vault0,
			token1Vault: vault1,
			createPoolFee: createPoolFee,
			observationState: observationAddress,
			tokenProgram: TOKEN_PROGRAM_ID,
			token0Program: token0.program,
			token1Program: token1.program,
			associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			systemProgram: web3.SystemProgram.programId,
			rent: web3.SYSVAR_RENT_PUBKEY,
			bondingCurveMint: mint,
		})

		.instruction()

	return [computeUnitIx, proxyInitIx]
}

export function getAccountsToAirdrop({ accounts, mint }: { accounts: Array<PublicKey>; mint: PublicKey }) {
	const users = accounts.reduce<PublicKey[]>((acc, owner) => {
		const ata = getAssociatedTokenAddressSync(mint, owner, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)

		if (owner && ata) {
			acc.push(owner)
			acc.push(ata)
		}

		return acc
	}, []) // ✅ Added empty array `[]` as the initial accumulator

	return users.slice(0, 20)
}

export interface CreateMintAccountArgs {
	name: string
	symbol: string
	uri: string
}

interface GetinitializeIxParams {
	program: Program<Rage>
	payer: PublicKey
	creator: PublicKey
	decimals: number
	args: CreateMintAccountArgs
	targetReserve: string
}

export async function getInitializeIx({ program, payer, creator, decimals, args, ...rest }: GetinitializeIxParams) {
	const mint = getRageToken({ program, tokenSymbol: args.symbol })

	const extraMetasAccount = getExtraMetas({ program, mint })

	const bondingCurveAuth = getBondingCurveAuth({ program, mint })
	const token0BondingCurveAta = await getAssociatedTokenAddress(mint, bondingCurveAuth, true, TOKEN_2022_PROGRAM_ID)
	const bondingCurveState = getBondingCurveState({
		program,
		mint,
	})

	const tradingFeeAuth = getTradingFeeAuth({ program, mint })

	const updateAuthority = new PublicKey('4GnStCzLnYzE1WLnXJnkbHBf64ZDdkpnPr2VFJnGJHCN')

	const init = await program.methods

		.initialize(decimals, args)
		.accountsStrict({
			payer: payer,
			token0Mint: mint,

			extraMetasAccount: extraMetasAccount,
			systemProgram: web3.SystemProgram.programId,
			associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			token0Program: TOKEN_2022_PROGRAM_ID,

			bondingCurveAuth,
			token0BondingCurveAta,
			bondingCurveState,

			tradingFeeAuth,

			updateAuthority,
		})
		.remainingAccounts([{ pubkey: creator, isSigner: false, isWritable: true }])
		.instruction()

	const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
		units: 400000,
	})

	const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
		microLamports: 20000,
	})

	return [modifyComputeUnits, init]
}

interface GetHarvestYieldIxParams {
	program: Program<Rage>
	creator: PublicKey
	mint: PublicKey
}

export async function getHarvestYieldIx({ program, creator, mint }: GetHarvestYieldIxParams) {
	const bondingCurveAuth = getBondingCurveAuth({ program, mint })

	const bondingCurveState = getBondingCurveState({
		program,
		mint,
	})

	const tradingFeeAuth = getTradingFeeAuth({ program, mint })

	const init = await program.methods

		.harvestYield()
		.accountsStrict({
			signer: creator,
			token0Mint: mint,

			systemProgram: web3.SystemProgram.programId,

			token0Program: TOKEN_2022_PROGRAM_ID,

			bondingCurveAuth,
			bondingCurveState,

			tradingFeeAuth,
		})
		.instruction()

	return init
}

interface SyncBondingCurveIxsParams {
	program: Program<Rage>
	payer: PublicKey
	mint: PublicKey
}

export async function getSyncBondingCurveIx({ program, payer, mint }: SyncBondingCurveIxsParams) {
	const bondingCurveAuth = getBondingCurveAuth({ program, mint })

	const bondingCurveState = getBondingCurveState({
		program,
		mint,
	})

	const token0BondingCurveAta = await getAssociatedTokenAddress(mint, bondingCurveAuth, true, TOKEN_2022_PROGRAM_ID)

	const sync = await program.methods
		.syncBondingCurve()
		.accountsStrict({
			payer,
			token0Mint: mint,

			bondingCurveAuth,

			bondingCurveState,

			systemProgram: web3.SystemProgram.programId,
			associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			token0Program: TOKEN_2022_PROGRAM_ID,

			token0BondingCurveAta,
		})
		.instruction()

	return sync
}

interface ReallocIxParams {
	program: Program<Rage>
	payer: PublicKey
	mint: PublicKey
}

export async function getReallocIx({ program, payer, mint }: ReallocIxParams) {
	const bondingCurveState = getBondingCurveState({
		program,
		mint,
	})

	const sync = await program.methods
		.realloc()
		.accountsStrict({
			payer,
			token0Mint: mint,

			bondingCurveState,

			systemProgram: web3.SystemProgram.programId,

			token0Program: TOKEN_2022_PROGRAM_ID,
		})
		.instruction()

	return sync
}
