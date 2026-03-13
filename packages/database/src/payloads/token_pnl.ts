import { type Prisma } from '../../generated/prisma/client'
import { selectTokenPnl } from '../selects'

export type TokenPnlRow = Prisma.TokenPnlGetPayload<{ select: typeof selectTokenPnl }>
