import { Token } from '@/app/comps/token'

export const dynamic = 'force-dynamic'

type Props = {
	params: Promise<{ mint: string }>
	searchParams: Promise<{ [key: string]: string }>
}

export default async function Page(props: Props) {
	return <Token {...props} />
}
