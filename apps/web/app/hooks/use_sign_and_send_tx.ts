import { useEffect } from 'react'
import { SignatureStatus, VersionedTransaction } from '@solana/web3.js'
import { useWallet } from '@jup-ag/wallet-adapter'
import { connection } from '@/app/utils/setup'
import { useAsync } from '@/app/hooks/use_async'
import { isInstructionError, getErrorMessage } from '@/app/utils/setup'
import { isMagicMint } from '@/app/utils/setup'
import { useLatestRef } from '@/app/hooks/use_latest_ref'

import * as Ably from 'ably'
import { useChannel } from 'ably/react'

const { deserialize } = VersionedTransaction

export function useSignAndSendTx(tx?: Uint8Array) {
	const { sendTransaction } = useWallet()

	const { run, data, setData, setError, isLoading, ...rest } = useAsync<string | undefined | SignatureStatus>()

	async function signAndSend(tx: Uint8Array) {
		const deserializedTx = deserialize(tx)

		const correctProgramId = isMagicMint(deserializedTx)

		if (!correctProgramId) {
			throw new Error('incorrect program id')
		}

		try {
			const sig = await sendTransaction(deserializedTx, connection, {
				skipPreflight: false,
			})

			return sig
		} catch (error) {
			// Either rethrow or return a rejected promise
			return Promise.reject(error)
		}
	}

	const signAndSendRef = useLatestRef(signAndSend)

	useEffect(() => {
		const fn = signAndSendRef.current

		if (tx) {
			run(fn(tx))
		}
	}, [tx, run])

	const { channel } = useChannel('signatureEvent', (message: Ably.Message) => {
		const sigEvent: SignatureStatus & { signature: string } = message.data

		const { signature, ...rest } = sigEvent

		// no transaction signature
		if (typeof data !== 'string') return

		// change data to signature status
		if (data === signature && rest.err === null) {
			setData(rest)
		}

		if (data === signature && isInstructionError(rest.err)) {
			const err = rest.err
			const code = err.InstructionError[1].Custom
			const errMessage = getErrorMessage(code)
			setError(errMessage)
		}
	})

	return {
		run,
		data,
		setData,
		setError,
		...rest,
		isLoading: isLoading ? true : typeof data === 'string' ? true : false,
		isSuccess: isSignatureStatus(data),
	}
}

export function isSignatureStatus(data: unknown): data is SignatureStatus {
	return (
		Boolean(data) &&
		typeof data === 'object' &&
		data !== null &&
		typeof (data as SignatureStatus).slot === 'number' &&
		(typeof (data as SignatureStatus).confirmations === 'number' || (data as SignatureStatus).confirmations === null) &&
		(typeof (data as SignatureStatus).err === 'string' ||
			typeof (data as SignatureStatus).err === 'object' ||
			(data as SignatureStatus).err === null) &&
		(typeof (data as SignatureStatus).confirmationStatus === 'undefined' ||
			(data as SignatureStatus).confirmationStatus === 'processed' ||
			(data as SignatureStatus).confirmationStatus === 'confirmed' ||
			(data as SignatureStatus).confirmationStatus === 'finalized')
	)
}
