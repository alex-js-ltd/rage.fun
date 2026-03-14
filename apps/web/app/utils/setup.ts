import { Program } from '@coral-xyz/anchor'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { type Rage, IDL } from '@repo/rage'
import { getEnv } from '@/app/utils/env'

const { ENDPOINT } = getEnv()

export const connection = new Connection(ENDPOINT, 'confirmed')

// Initialize the program interface with the IDL, program ID, and connection.
// This setup allows us to interact with the on-chain program using the defined interface.

export const program = new Program<Rage>(IDL as Rage, {
	connection,
})

// Create a mapping of error codes to messages
const errorMap = new Map<number, string>()
IDL.errors.forEach(error => {
	if (typeof error.msg === 'string') errorMap.set(error.code, error.msg)
})

// Function to get the error message by code
export function getErrorMessage(errorCode: number): string {
	return errorMap.get(errorCode) || 'Unknown error occurred.'
}

type CustomError = {
	InstructionError: [number, { Custom: number }]
}

export function isInstructionError(error: unknown): error is CustomError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'InstructionError' in error &&
		Array.isArray(error.InstructionError) &&
		error.InstructionError.length === 2 &&
		typeof error.InstructionError[0] === 'number' &&
		typeof error.InstructionError[1] === 'object' &&
		error.InstructionError[1] !== null &&
		'Custom' in error.InstructionError[1] &&
		typeof error.InstructionError[1].Custom === 'number'
	)
}

export function isRage(deserializedTx: VersionedTransaction): boolean {
	return deserializedTx.message.compiledInstructions.some(ix =>
		deserializedTx.message.staticAccountKeys[ix.programIdIndex].equals(program.programId),
	)
}
