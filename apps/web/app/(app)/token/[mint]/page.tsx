import type { Metadata, ResolvingMetadata } from 'next'
import { getTokenMetadata } from '@/app/data/get_token_metadata'
import { TokenView } from '@/app/comps/token_view'

type Props = {
	params: Promise<{ mint: string }>
	searchParams: Promise<{ [key: string]: string }>
}

export default async function Page(props: Props) {
	return <TokenView {...props} />
}

export async function generateMetadata({ params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
	const id = (await params).mint

	// fetch post information
	const meta = await getTokenMetadata(id)

	return {
		title: meta.name,
		description: meta.description,

		openGraph: {
			title: meta.name,
			description: meta.description,
			images: [
				{
					url: meta.image,

					alt: meta.name,
				},
			],
			type: 'website',
		},

		twitter: {
			card: 'summary_large_image',
			title: meta.name,
			description: meta.description,
			images: [meta.image],
		},
	}
}
