import { TokenView } from '@/app/comps/token_view'

export const dynamic = 'force-dynamic'

type Props = {
	params: Promise<{ mint: string }>
	searchParams: Promise<{ [key: string]: string }>
}

export default async function Page(props: Props) {
	return <TokenView {...props} />
}
