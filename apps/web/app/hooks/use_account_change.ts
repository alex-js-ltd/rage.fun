import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { delay } from '@/app/utils/misc'
import { useLatestRef } from './use_latest_ref'
import { connection } from '@/app/utils/setup'
import { PublicKey } from '@solana/web3.js'

export function useAccountChange(mint: string) {
	const router = useRouter()

	const callback = useLatestRef(async () => {
		await delay(300)
		console.log('refetch')
		router.refresh()
	})

	useEffect(() => {
		const publicKey = new PublicKey(mint)

		const subscriptionId = connection.onAccountChange(publicKey, async res => {
			console.log(res)
			await callback.current() // Ensure callback uses the latest reference
		})

		// Cleanup event listener when unmounting
		return () => {
			connection.removeAccountChangeListener(subscriptionId)
		}
	}, [mint])
}
