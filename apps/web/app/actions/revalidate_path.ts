'use server'

import { revalidatePath } from 'next/cache'

export async function revalidatePathAction(paths: string[], type?: 'page' | 'layout') {
	paths.forEach(p => {
		console.log(`Revalidating path: ${p}`)
		revalidatePath(p, type) // ✅ Trigger cache invalidation
	})
}
