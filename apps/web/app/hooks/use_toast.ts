'use client'

import { useEffect, useState, useRef } from 'react'
import { useAsync } from '@/app/hooks/use_async'
import { type ToastProps } from '@/app/comps/toast'
import { SignatureStatus } from '@solana/web3.js'
import { getErrorMessage } from '../utils/misc'

type AsyncState = ReturnType<typeof useAsync<string | undefined | SignatureStatus>>

export interface ToastDescription {
	loading: string
	success: string
}

export function useToast(async: AsyncState) {
	const { isIdle, isLoading, isSuccess, isError, error } = async

	const [open, setOpen] = useState(false)

	const timerRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		if (isLoading || isError) {
			setOpen(true)
		}

		if (isSuccess || isError) {
			timerRef.current = setTimeout(() => setOpen(false), 8000)
		}

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [isLoading, isSuccess, isError, error])

	function onOpenChange(open: boolean) {
		setOpen(open)
	}

	function getDescription(params: ToastDescription) {
		if (isLoading) {
			return params.loading
		}

		if (isSuccess) {
			return params.success
		}

		if (isError) {
			return getErrorMessage(error)
		}
	}

	function getToastProps(params: ToastDescription): ToastProps {
		const description = getDescription(params)

		const className = isLoading ? 'animate-pulse' : isIdle ? 'hidden' : undefined

		return {
			open,
			onOpenChange,
			description,
			className,
			duration: Infinity,
		}
	}

	return { getToastProps }
}
