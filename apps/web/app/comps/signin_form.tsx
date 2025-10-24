import { useActionState, useEffect, useRef } from 'react'
import { useAsync } from '@/app/hooks/use_async'
import { useUnifiedWallet } from '@jup-ag/wallet-adapter'
import { SigninMessage } from '@/app/utils/sign_in'
import bs58 from 'bs58'
import { authenticate } from '@/app/actions/authenticate'
import { useLatestRef } from '@/app/hooks/use_latest_ref'

export function SignInForm({ nonce }: { nonce: string }) {
	const { publicKey, signMessage, connected } = useUnifiedWallet()

	const message = new SigninMessage({
		domain: window.location.host,
		publicKey: publicKey?.toBase58() ?? '',
		statement: `Sign in to letsrage.fun `,
		nonce,
	})

	const messageRef = useLatestRef(message)

	const signatureRef = useLatestRef(async () => {
		if (!signMessage) return
		const data = new TextEncoder().encode(message.prepare())
		const signature = await signMessage(data)
		const serializedSignature = bs58.encode(signature)
		return serializedSignature
	})

	const { run, data } = useAsync<string | undefined>()

	useEffect(() => {
		const promise = signatureRef.current()

		if (!promise) return

		run(promise)
	}, [run, connected])

	const formRef = useRef<HTMLFormElement>(null)

	const [lastResult, formAction, isPending] = useActionState(authenticate, undefined)

	useEffect(() => {
		if (data && !isPending) {
			formRef.current?.requestSubmit()
		}
	}, [data, isPending])

	return (
		<form className="sr-only" ref={formRef} action={formAction}>
			<input type="hidden" name="domain" value={messageRef.current.domain} />
			<input type="hidden" name="publicKey" value={messageRef.current.publicKey} />
			<input type="hidden" name="statement" value={messageRef.current.statement} />
			<input type="hidden" name="nonce" value={messageRef.current.nonce} />
			<input type="hidden" name="signature" value={data ?? ''} />
		</form>
	)
}
