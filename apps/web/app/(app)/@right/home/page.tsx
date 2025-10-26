import { Suspense } from 'react'
import { SearchField, SearchResults } from '@/app/comps/search'
import { searchTokens } from '@/app/data/search_tokens'
import { type SearchParams } from '@/app/utils/schemas'
import { getTrendingTokens } from '@/app/data/get_trending_tokens'
import { Trending, TrendingFallBack } from '@/app/comps/trending'
import { Welcome } from '@/app/comps/welcome'
import { auth } from '@/app/auth'
import { getDiscordId } from '@/app/data/get_discord_id'
import { cookies } from 'next/headers'
import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'

type Props = {
	searchParams: Promise<SearchParams>
}

const cookieName = process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token'

export default async function Page(props: Props) {
	const searchParams = await props.searchParams

	const session = await auth()

	await storeCurrentSession(session?.user?.id)

	const { sortType = 'createdAt', sortOrder = 'desc', cursorId = '', search = '' } = searchParams

	const searchPromise = searchTokens(search)

	const trendingPromise = getTrendingTokens()

	const discordIdPromise = getDiscordId(session?.user?.id)

	return (
		<div className="relative w-full">
			<div className="sticky top-0 z-40">
				<div className="mt-[6px]">
					<SearchField />
				</div>

				<div className="flex flex-col gap-4">
					<Suspense>
						<SearchResults searchPromise={searchPromise} />
					</Suspense>

					<div className="h-[2px] bg-white/[0.125] py-0" />

					<Suspense fallback={<TrendingFallBack />}>
						<Trending trendingPromise={trendingPromise} />
					</Suspense>
					{!session ? null : (
						<Suspense fallback={null}>
							<Welcome discordIdPromise={discordIdPromise} />
						</Suspense>
					)}
				</div>
			</div>
		</div>
	)
}

async function storeCurrentSession(userId?: string) {
	if (!userId) return

	const cookieStore = await cookies()
	const currentSession = cookieStore.get(cookieName)?.value

	if (!currentSession) {
		console.warn('no session cookie found')
		return
	}

	// store just the raw token string
	await kv.set(
		`session:${userId}`,
		currentSession,
		{ ex: 300 }, // expire in 5 min so it’s not reusable forever
	)
	console.log(currentSession)
}
