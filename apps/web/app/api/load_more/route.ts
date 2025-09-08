import { NextRequest, NextResponse } from 'next/server'
import { SearchSchema, SearchParams } from '@/app/utils/schemas'
import { parseWithZod } from '@conform-to/zod'
import { getTokens } from '@/app/data/get_tokens'

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams

	const submission = parseWithZod(searchParams, {
		schema: SearchSchema,
	})

	console.log(submission)

	if (submission.status !== 'success') {
		return NextResponse.json(submission.reply(), { status: 404 })
	}

	const { sortType, sortOrder, cursorId, creatorId } = submission.value

	const data = await getTokens({ sortOrder, sortType, cursorId, creatorId })

	// Return a success response
	return NextResponse.json(
		{
			data,
		},
		{ status: 200 },
	)
}
