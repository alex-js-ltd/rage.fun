import { type Prisma } from '../../generated/prisma/client'
import { selectTokenFeed } from '../selects'

export type TokenFeedRow = Prisma.TokenGetPayload<{ select: typeof selectTokenFeed }>
