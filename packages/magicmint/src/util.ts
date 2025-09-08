import { NATIVE_MINT, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, Keypair } from '@solana/web3.js'
import { type TokenMetadata } from '@solana/spl-token-metadata'
import { getMagicMintToken } from './pda'
import { Magicmint } from '../target/types/magicmint'
import { Program, BN, web3, EventParser, BorshCoder, IdlEvents } from '@coral-xyz/anchor'

interface Token {
	keypair: Keypair
	mint: PublicKey
	program: PublicKey
	decimals: number
	metadata: TokenMetadata
}

export const SOL: Pick<Token, 'mint' | 'program' | 'decimals'> = {
	mint: NATIVE_MINT,
	program: TOKEN_PROGRAM_ID,
	decimals: 9,
}

interface GenerateToken {
	program: Program<Magicmint>
}

export function generateToken({ program }: GenerateToken) {
	const name = 'OPS'
	const symbol = 'OPS'
	const uri = 'https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json'

	const mint = getMagicMintToken({ program, tokenSymbol: symbol })

	return { name, symbol, uri, mint, decimals: 9 }
}

export function sortTokens(tokens: Array<{ mint: PublicKey; program: PublicKey }>) {
	return tokens.toSorted((x, y) => {
		const buffer1 = x.mint.toBuffer()
		const buffer2 = y.mint.toBuffer()

		for (let i = 0; i < buffer1.length && i < buffer2.length; i++) {
			if (buffer1[i] < buffer2[i]) {
				return -1
			}
			if (buffer1[i] > buffer2[i]) {
				return 1
			}
		}

		if (buffer1.length < buffer2.length) {
			return -1
		}
		if (buffer1.length > buffer2.length) {
			return 1
		}

		return 0
	})
}
