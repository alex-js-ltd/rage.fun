import { prisma } from '@/app/utils/db'
import { LeaderBoardSchema } from '@/app/utils/schemas'
import { ZodError } from 'zod'

export async function getLeaderBoard(limit = 100) {
	const rows = await prisma.user.findMany({
		include: {
			pnl: true, // include their PnL record
		},

		where: { pnl: { isNot: null } },
		orderBy: {
			pnl: {
				realizedPnl: 'desc', // sort by highest realized profit
			},
		},
		take: 5,
	})

	if (rows.length === 0) {
		throw new Error('No users found')
	}

	return rows.map(u => {
		const parsed = LeaderBoardSchema.safeParse(u)

		if (!parsed.success) {
			// Optional: prefix the path so it’s obvious the object that failed
			const issues = parsed.error.issues.map(issue => ({
				...issue,
				path: [...issue.path],
			}))

			// Log nicely for server debugging
			console.error('❌ Invalid token with relations:', parsed.error.format())

			// Throw a real ZodError so upstream can `catch (e instanceof ZodError)`
			throw new ZodError(issues)
		}

		return parsed.data
	})
}
