'use client'

import { Icon } from './_icon'
import { LinkDiscord } from './link_discord'

export function Welcome({ discordId }: { discordId: string | null }) {
	if (discordId) return null
	return (
		<div className="border border-white border-opacity-[0.125] rounded-2xl w-full overflow-hidden">
			<div className="h-[48px] flex items-center px-3">
				<h2 className="text-white font-semibold text-[15px]">Welcome to letsrage.fun</h2>
			</div>
			<div className="grid">
				<LinkDiscord asChild discordId={discordId}>
					<div className="w-full hover:bg-white/10 h-[65.55px] px-3 cursor-pointer">
						<div className="flex items-center justify-between h-full">
							<div className="relative size-[40px]">
								<Icon name="Discord-Logo" className="w-full h-full object-cover object-center" />
							</div>

							<span className="text-text-100 text-sm">{discordId ? 'Account Linked' : 'Link Discord'}</span>
						</div>
					</div>
				</LinkDiscord>
			</div>
		</div>
	)
}
