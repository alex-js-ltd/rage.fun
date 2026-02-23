import { NextRequest, NextResponse } from 'next/server'
import { SearchSchema } from '@/app/utils/schemas'
import { parseWithZod } from '@conform-to/zod'
import { getTokenFeed } from '@/app/data/get_token_feed'

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams

	const submission = parseWithZod(searchParams, {
		schema: SearchSchema,
	})

	if (submission.status !== 'success') {
		return NextResponse.json(submission.reply(), { status: 404 })
	}

	const { sortType, sortOrder, cursorId, creatorId } = submission.value

	const data = await getTokenFeed({ sortOrder, sortType, cursorId, creatorId })

	// Return a success response
	return NextResponse.json(
		{
			data,
		},
		{ status: 200 },
	)
}
