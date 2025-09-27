'use server'

import { revalidatePath } from 'next/cache'

/**
 * Revalidates the Next.js cache for a given path.
 *
 * @param path - The path to invalidate (e.g., "/token/@chart/123")
 */
export async function revalidatePathAction(path: string, type?: 'page' | 'layout') {
	console.log(`Revalidating path: ${path}`)
	revalidatePath(path, type) // ✅ Trigger cache invalidation
}
