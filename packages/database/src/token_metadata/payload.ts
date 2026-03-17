import { type Prisma } from '../../generated/prisma/client'
import { selectTokenMetadata } from './select'

export type MetadataRow = Prisma.MetadataGetPayload<{ select: typeof selectTokenMetadata }>
