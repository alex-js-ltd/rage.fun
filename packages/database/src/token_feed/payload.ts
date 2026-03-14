import { type Prisma } from '../../generated/prisma/client'
import { selectTokenFeed } from './select'

export type TokenFeedRow = Prisma.TokenGetPayload<{ select: typeof selectTokenFeed }>
