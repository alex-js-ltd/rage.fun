import { z } from 'zod'
import { SearchSchema } from './schema'

export type SearchParams = z.infer<typeof SearchSchema>
