import type { Metadata, ResolvingMetadata } from 'next'
import { getCachedTokenMetadata } from '@/app/data/get_token_metadata'
import { TokenSearchParamsSchema } from '@/app/utils/schemas'

export const dynamic = 'force-dynamic'

type Props = {
	params: Promise<{ mint: string }>
	searchParams: Promise<{ [key: string]: string }>
}

export default async function Page(props: Props) {
	const [{ mint }, searchParams] = await Promise.all([props.params, props.searchParams])

	const parse = TokenSearchParamsSchema.safeParse(searchParams)

	if (parse.error) {
		return <div>incorrect search params</div>
	}

	return null
}

export async function generateMetadata({ params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
	const id = (await params).mint

	// fetch post information
	const meta = await getCachedTokenMetadata(id)

	return {
		title: meta.name,
		description: meta.description,

		openGraph: {
			title: meta.name,
			description: meta.description,
			images: [
				{
					url: meta.image, // Replace with your actual image URL
				},
			],
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title: meta.name,
			description: meta.description,
			images: [meta.image], // Replace with your actual image URL
		},
	}
}
