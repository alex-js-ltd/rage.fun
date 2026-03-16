import { useWallet } from '@jup-ag/wallet-adapter'

export function usePayer() {
	const { publicKey } = useWallet()
	return publicKey?.toBase58()
}
