import { RandomAirdropForm } from '@/app/comps/random_airdrop_form'
import { getTokenList } from '@/app/data/get_token_list'

export const dynamic = 'force-dynamic'

type Props = {
	searchParams: Promise<{ query?: string }>
}

export default async function Page(props: Props) {
	const { query: wallet = '' } = await props.searchParams

	const walletPromise = getTokenList(wallet)

	return (
		<div className="w-full">
			<RandomAirdropForm walletPromise={walletPromise} />
		</div>
	)
}
