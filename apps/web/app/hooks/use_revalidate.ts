import { useEffect } from 'react'
import { revalidatePathAction } from '@/app//actions/revalidate_path'
import { useAsync } from '@/app/hooks/use_async'

export function useRevalidate(isSuccess: boolean, paths: string[]) {
	const { run } = useAsync()

	useEffect(() => {
		if (!isSuccess) return

		const promise = revalidatePathAction(paths)

		run(promise)
	}, [isSuccess])
}
