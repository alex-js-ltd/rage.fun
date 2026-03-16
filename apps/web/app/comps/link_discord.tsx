'use client'

import { signIn } from 'next-auth/react'
import { storeSession } from '@/app/actions/store_session'
import { useAsync } from '@/app/hooks/use_async'
import { Button } from '@/app/comps/ui/button'
import { Icon } from '@/app/comps/ui/_icon'

export function LinkDiscord({ discordId }: { discordId: string | null }) {
	const { run } = useAsync()

	if (discordId) return null

	async function handleLink() {
		const userId = await storeSession()

		await signIn('discord', {
			callbackUrl: `/api/link_discord?userId=${userId}`,
		})
	}

	return (
		<div className="w-full overflow-hidden rounded-2xl border border-white/12.5">
			<div className="flex h-12 items-center px-3">
				<h2 className="text-[15px] font-semibold text-white">Welcome to letsrage.fun</h2>
			</div>

			<div className="grid">
				<Button
					asChild
					onClick={() => {
						run(handleLink())
					}}
				>
					<div className="flex h-[65.55px] w-full cursor-pointer items-center justify-between px-3 hover:bg-white/10">
						<div className="relative size-10">
							<Icon name="Discord-Logo" className="h-full w-full object-cover object-center" />
						</div>

						<span className="text-sm text-text-100">Link Discord</span>
					</div>
				</Button>
			</div>
		</div>
	)
}
