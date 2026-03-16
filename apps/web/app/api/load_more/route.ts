import { NextRequest, NextResponse } from 'next/server'
import { SearchParamsSchema } from '@/app/utils/schemas'
import { getTokenFeed } from '@/app/data/get_token_feed'

import { parseSubmission, report } from '@conform-to/react/future'

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams

	const submission = parseSubmission(searchParams)

	const result = SearchParamsSchema.safeParse(submission.payload)

	if (!result.success) {
		return NextResponse.json(
			{
				...report(submission, {
					error: {
						issues: result.error.issues,
					},
				}),
			},
			{ status: 404 },
		)
	}

	const { sortType, sortOrder, cursorId, creatorId } = result.data

	const data = await getTokenFeed({ sortOrder, sortType, cursorId, creatorId })

	// Return a success response
	return NextResponse.json(
		{
			data,
		},
		{ status: 200 },
	)
}
