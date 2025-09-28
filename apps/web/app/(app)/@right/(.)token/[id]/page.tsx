import { Suspense } from 'react'
import { SwapForm, SwapFormFallback } from '@/app/comps/swap_form'
import { getTokenWithRelations } from '@/app/data/get_token'
import { auth } from '@/app/auth'

type Props = {
	params: Promise<{ id: string }>
}

export default async function Page(props: Props) {
	const { id: mint } = await props.params

	const tokenPromise = getTokenWithRelations(mint)

	const session = await auth()

	return (
		<div className="relative w-full justify-self-start">
			<div className="sticky top-[5px] z-40 flex flex-col mt-[5px]">
				<Suspense fallback={<SwapFormFallback />}>
					<SwapForm tokenPromise={tokenPromise} signer={session?.user?.id} />
				</Suspense>
			</div>
		</div>
	)
}
