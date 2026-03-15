'use client'

import React, { type RefObject, type ReactNode, createContext, useMemo, use, useCallback, useRef } from 'react'
import { type InputProps } from '@/app/comps/ui/input'

import { useAsync } from '@/app/hooks/use_async'
import { client } from '@/app/utils/client'
import { PinataSDK } from 'pinata'
import { useSession } from 'next-auth/react'

async function uploadImage(file: File) {
	// Optional: validate type/size here to fail fast
	const res = await client<{ url: string }>(`/api/pinata/presign`, {})
	const upload = await pinata.upload.public.file(file).url(res.url)
	return `https://indigo-adverse-vicuna-777.mypinata.cloud/ipfs/${upload.cid}`
}

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

	const { status } = useSession()

	const getInputProps = useCallback<(name: string) => InputProps>(
		name => ({
			className: 'sr-only',
			type: 'file',
			accept: 'image/*',
			name,
			ref: fileRef,

			onChange: async e => {
				console.log('status', status)

				if (status === 'unauthenticated') {
					return
				}
				const file = e.target.files?.[0]

				if (!file) return

				try {
					await run(uploadImage(file))
				} catch (err) {
					if (fileRef.current) {
						fileRef.current.value = ''
					}
				} finally {
					if (fileRef.current) {
						fileRef.current.value = ''
					}
				}
			},
		}),
		[status, run],
	)

	const value = useMemo(
		() => ({ fileRef, data, isLoading, clearImage, getInputProps }),
		[data, isLoading, clearImage, getInputProps],
	)

	return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
}

function useImage() {
	const context = use(ImageContext)
	if (!context) {
		throw new Error('useImage must be used within a ImageProvider')
	}
	return context
}

export { ImageProvider, useImage }
