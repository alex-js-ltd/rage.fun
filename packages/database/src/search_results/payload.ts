import { type Prisma } from '../../generated/prisma/client'
import { selectSearchResults } from './select'

export type SearchResultRow = Prisma.TokenGetPayload<{ select: typeof selectSearchResults }>
