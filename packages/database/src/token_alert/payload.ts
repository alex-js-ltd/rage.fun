import { type Prisma } from '../../generated/prisma/client'
import { selectTokenAlert } from './select'

export type TokenAlertRow = Prisma.TokenGetPayload<{ select: typeof selectTokenAlert }>
