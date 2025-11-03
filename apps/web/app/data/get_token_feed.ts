import { cache } from 'react'
import { prisma } from '@/app/utils/db'
import { createTokenFeedSchema } from '@/app/utils/schemas'
import { getSolPrice } from '@/app/data/get_sol_price'
import { ZodError } from 'zod'
import 'server-only'

export const getTokenFeed = cache(async (mint: string) => {
	const token = await prisma.token.findUniqueOrThrow({
		where: { id: mint },
		include: { metadata: true, bondingCurve: true, marketData: true },
	})

	const solPrice = await getSolPrice()
	const TokenFeedSchema = createTokenFeedSchema({ solPrice })

	const parsed = TokenFeedSchema.safeParse(token)

	if (!parsed.success) {
		// Optional: prefix the path so it’s obvious the object that failed
		const issues = parsed.error.issues.map(issue => ({
			...issue,
			path: ['token', ...issue.path],
		}))

		// Log nicely for server debugging
		console.error('❌ Invalid token with relations:', parsed.error.format())

		// Throw a real ZodError so upstream can `catch (e instanceof ZodError)`
		throw new ZodError(issues)
	}

	return parsed.data
})
