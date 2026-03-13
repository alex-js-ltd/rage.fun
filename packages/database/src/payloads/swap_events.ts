import { type Prisma } from '../../generated/prisma/client'
import { selectSwapEvents } from '../selects'

export type SwapEventRow = Prisma.TokenGetPayload<{ select: typeof selectSwapEvents }>
