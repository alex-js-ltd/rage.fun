import { useEffect } from 'react'
import { revalidatePathAction } from '@/app//actions/revalidate_path'
import { useAsync } from '@/app/hooks/use_async'

export function useRevalidate(isSuccess: boolean, path: string) {
	const { run } = useAsync()

	useEffect(() => {
		if (!isSuccess) return

		const promise = revalidatePathAction(`${path}`)

		run(promise)
	}, [isSuccess])
}
