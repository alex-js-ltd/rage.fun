'use client'

import React, {
	type RefObject,
	type ReactNode,
	createContext,
	useMemo,
	use,
	useCallback,
	useState,
	useRef,
	useEffect,
} from 'react'
import { type InputProps } from '@/app/comps/input'
import { type ImageProps } from 'next/image'
import invariant from 'tiny-invariant'
import { useAsync } from '@/app/hooks/use_async'
import { client } from '@/app/utils/client'
import { PinataSDK } from 'pinata'

const pinata = new PinataSDK({
	pinataGateway: 'indigo-adverse-vicuna-777.mypinata.cloud',
})

type Context = {
	fileRef: RefObject<HTMLInputElement | null>
	image?: ImageProps
	cid?: string | null
	clearImage: () => void
	getInputProps: (name: string) => InputProps
}

const ImageContext = createContext<Context | undefined>(undefined)
ImageContext.displayName = 'ImageContext'

function ImageProvider({ children }: { children: ReactNode }) {
	const [image, setImage] = useState<ImageProps | undefined>(undefined)

	const fileRef = useRef<HTMLInputElement>(null)

	const clearImage = useCallback(() => {
		if (fileRef.current) {
			fileRef.current.value = ''
			setImage(undefined)
		}
	}, [])

	const { run, data: cid } = useAsync<string>()

	async function uploadImage(file: File) {
		const res = await client<{ url: string }>(`/api/pinata/presign`, {})
		console.log(res)
		const upload = await pinata.upload.public.file(file).url(res.url) // Upload the file with the signed URL
		console.log(upload)
		return upload.cid
	}

	const getInputProps = useCallback<(name: string) => InputProps>(name => {
		return {
			className: 'sr-only pointer-events-none',
			type: 'file',
			accept: 'image/*',
			name,
			ref: fileRef,
			async onChange(e) {
				fileRef?.current?.focus()
				const file = e.target.files?.[0]

				if (file) {
					const reader = new FileReader()

					reader.onloadend = async () => {
						const image = { src: reader.result, alt: 'your uploaded image' }

						if (isImage(image)) {
							setImage(image)
							const promise = uploadImage(file)
							run(promise)
						}
					}

					reader.readAsDataURL(file)
				} else {
					setImage(undefined)
				}
			},
		}
	}, [])

	const value = useMemo(
		() => ({ fileRef, image, cid, clearImage, getInputProps }),
		[cid, image, clearImage, getInputProps],
	)

	return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
}

function useImage() {
	const context = use(ImageContext)
	invariant(context, 'useImage must be used within a ImageProvider')
	return context
}

export { ImageProvider, useImage }

function isImage(image: unknown): image is ImageProps {
	return (
		Boolean(image) &&
		typeof image === 'object' &&
		typeof (image as ImageProps).src === 'string' &&
		typeof (image as ImageProps).alt === 'string'
	)
}
