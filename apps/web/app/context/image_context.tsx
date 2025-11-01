'use client'

import React, { type RefObject, type ReactNode, createContext, useMemo, use, useCallback, useRef } from 'react'
import { type InputProps } from '@/app/comps/input'
import { type ImageProps } from 'next/image'
import invariant from 'tiny-invariant'
import { useAsync } from '@/app/hooks/use_async'
import { client } from '@/app/utils/client'
import { PinataSDK } from 'pinata'
import { useSession } from 'next-auth/react'

const pinata = new PinataSDK({
	pinataGateway: 'indigo-adverse-vicuna-777.mypinata.cloud',
})

type Context = {
	fileRef: RefObject<HTMLInputElement | null>
	data?: string | null
	isLoading: boolean
	clearImage: () => void
	getInputProps: (name: string) => InputProps
}

const ImageContext = createContext<Context | undefined>(undefined)
ImageContext.displayName = 'ImageContext'

function ImageProvider({ children }: { children: ReactNode }) {
	const { run, data, isLoading, reset } = useAsync<string>()

	const fileRef = useRef<HTMLInputElement>(null)

	const clearImage = useCallback(() => {
		if (fileRef.current) {
			fileRef.current.value = ''
			reset()
		}
	}, [])

	async function uploadImage(file: File) {
		const res = await client<{ url: string }>(`/api/pinata/presign`, {})
		const upload = await pinata.upload.public.file(file).url(res.url) // Upload the file with the signed URL
		const image = `https://indigo-adverse-vicuna-777.mypinata.cloud/ipfs/${upload.cid}`
		return image
	}

	const session = useSession()

	const isAuthenticated = session.status === 'authenticated'

	const getInputProps = useCallback<(name: string) => InputProps>(
		name => {
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
							if (!isAuthenticated) return

							const promise = uploadImage(file)
							run(promise)
						}

						reader.readAsDataURL(file)
					} else {
						reset()
					}
				},
			}
		},
		[isAuthenticated, reset],
	)

	const value = useMemo(
		() => ({ fileRef, data, isLoading, clearImage, getInputProps }),
		[data, isLoading, clearImage, getInputProps],
	)

	return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
}

function useImage() {
	const context = use(ImageContext)
	invariant(context, 'useImage must be used within a ImageProvider')
	return context
}

export { ImageProvider, useImage }
