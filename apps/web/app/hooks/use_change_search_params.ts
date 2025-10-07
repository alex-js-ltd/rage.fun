import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SearchParams } from '@/app/utils/schemas'
import { useLatestRef } from '@/app/hooks/use_latest_ref'

export function useChangeSearchParams(name: string) {
	const searchParams = useSearchParams()
	const { replace } = useRouter()
	const pathname = usePathname()

	const createQueryString = useCallback(
		(value: string) => {
			const params = new URLSearchParams(searchParams)
			params.delete('cursorId')
			params.set(name, value)

			replace(`${pathname}?${params.toString()}`, { scroll: false })
		},
		[searchParams],
	)

	return { createQueryString }
}
