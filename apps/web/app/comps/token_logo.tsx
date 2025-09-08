import Image, { type ImageProps } from 'next/image'
import { cn } from '@/app/utils/misc'
import { createPngDataUri } from 'unlazy/thumbhash'
import { type TokenMetadataType } from '@/app/utils/schemas'

export { type ImageProps }

export function TokenLogo({ src, alt, className, ...rest }: ImageProps) {
	return (
		<div className={cn('shrink-0 relative flex items-center overflow-hidden h-5 w-5 rounded pr-1', className)}>
			<Image
				className="relative object-cover object-center rounded-lg"
				fill={true}
				src={src}
				alt={alt}
				placeholder="blur"
				{...rest}
			/>
		</div>
	)
}

export function getTokenLogoProps(token: Pick<TokenMetadataType, 'image' | 'thumbhash' | 'symbol'>): ImageProps {
	const blurDataURL = createPngDataUri(token.thumbhash)

	return { src: token.image, alt: token.symbol, blurDataURL, placeholder: 'blur', sizes: '40px' }
}

export const solLogoProps: ImageProps = {
	alt: 'SOL',
	src: 'https://img-v1.raydium.io/icon/So11111111111111111111111111111111111111112.png',
	blurDataURL: createPngDataUri(
		Buffer.from([
			0x85, 0xe7, 0x09, 0x17, 0x04, 0x07, 0x98, 0x98, 0x77, 0x88, 0x77, 0x81, 0x7c, 0x86, 0x77, 0x78, 0x87, 0x88, 0x7a,
			0x9f, 0xe7, 0xfb, 0x73, 0x0f,
		]).toString('base64'),
	),
	sizes: '40px',
	placeholder: 'blur',
}
