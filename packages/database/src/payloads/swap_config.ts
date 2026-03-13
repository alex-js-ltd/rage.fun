import { type Prisma } from '../../generated/prisma/client'
import { selectSwapConfig } from '../selects'

export type SwapConfigRow = Prisma.TokenGetPayload<{ select: typeof selectSwapConfig }>
