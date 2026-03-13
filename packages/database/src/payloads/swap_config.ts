import { type Prisma } from '../../generated/prisma/client'
import { selectSwapConfig } from '../selects'

export type SwapConfig = Prisma.TokenGetPayload<{ select: typeof selectSwapConfig }>
