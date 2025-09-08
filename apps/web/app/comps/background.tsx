'use client'

import { use } from 'react'
import { type TokenWithRelationsType } from '@/app/utils/schemas'
import Image from 'next/image'
import { createPngDataUri } from 'unlazy/thumbhash'

export function Background({ tokenPromise }: { tokenPromise: Promise<TokenWithRelationsType> }) {
	const { image, thumbhash, name } = use(tokenPromise)

	return (
		<Image
			className="object-cover object-center w-full h-full"
			src={createPngDataUri(thumbhash!)}
			alt={name}
			fill={true}
			blurDataURL={createPngDataUri(thumbhash!)}
			placeholder="blur"
		/>
	)
}
