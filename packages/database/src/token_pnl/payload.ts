import { type Prisma } from '../../generated/prisma/client'
import { selectTokenPnl } from './select'

export type TokenPnlRow = Prisma.TokenPnlGetPayload<{ select: typeof selectTokenPnl }>
