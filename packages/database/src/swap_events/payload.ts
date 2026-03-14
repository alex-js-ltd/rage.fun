import { type Prisma } from '../../generated/prisma/client'
import { selectSwapEvents } from './select'

export type SwapEventRow = Prisma.TokenGetPayload<{ select: typeof selectSwapEvents }>
