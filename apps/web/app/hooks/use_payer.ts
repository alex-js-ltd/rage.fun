import { useWallet } from '@jup-ag/wallet-adapter'
import { useMemo } from 'react'

export function usePayer() {
	const { publicKey } = useWallet()

	return useMemo(() => publicKey?.toBase58(), [publicKey])
}
