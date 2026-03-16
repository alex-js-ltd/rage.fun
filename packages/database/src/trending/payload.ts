import { type Prisma } from '../../generated/prisma/client'
import { selectTrending } from './select'

export type TrendingRow = Prisma.TokenGetPayload<{ select: typeof selectTrending }>
