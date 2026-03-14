import { type Prisma } from '../../generated/prisma/client'
import { selectSwapEvents } from './select'

export type SwapEventRow = Prisma.SwapEventGetPayload<{ select: typeof selectSwapEvents }>
