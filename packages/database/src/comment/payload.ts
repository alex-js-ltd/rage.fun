import { type Prisma } from '../../generated/prisma/client'
import { selectComment } from './select'

export type CommentRow = Prisma.CommentGetPayload<{ select: typeof selectComment }>
