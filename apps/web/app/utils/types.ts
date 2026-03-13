import { z } from 'zod'
import { SearchParamsSchema } from './schema'

export type SearchParams = z.infer<typeof SearchParamsSchema>
