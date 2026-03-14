import { z } from 'zod'

export const SearchParamsSchema = z.object({
	sortType: z.enum(['createdAt', 'lastTrade', 'marketCap', 'volume']).default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
	cursorId: z.string().optional(),
	search: z.string().optional(),
	creatorId: z.string().optional(),
})

export type SearchParams = z.infer<typeof SearchParamsSchema>
