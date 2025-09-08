import { PublicKey } from '@solana/web3.js'

export type CLUSTER = 'mainnet-beta' | 'devnet'

interface Config {
	cpSwapProgram: PublicKey
	configAddress: PublicKey
	createPoolFee: PublicKey
}

export function getCPMMConfig(cluster: CLUSTER = 'mainnet-beta'): Config {
	const addresses: Record<CLUSTER, Config> = {
		'mainnet-beta': {
			cpSwapProgram: new PublicKey('CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C'),
			configAddress: new PublicKey('D4FPEruKEHrG5TenZ2mpDGEfu1iUvTiqBxvpU8HLBvC2'),
			createPoolFee: new PublicKey('DNXgeM9EiiaAbaWvwjHj9fQQLAX5ZsfHyvmYUNRAdNC8'),
		},
		devnet: {
			cpSwapProgram: new PublicKey('CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW'),
			configAddress: new PublicKey('9zSzfkYy6awexsHvmggeH36pfVUdDGyCcwmjT3AQPBj6'),
			createPoolFee: new PublicKey('G11FKBRaAkHAKuLCgLM6K6NUc9rTjPAznRCjZifrTQe2'),
		},
	}

	return addresses[cluster]
}
