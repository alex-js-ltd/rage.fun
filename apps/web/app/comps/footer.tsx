import React from 'react'
import { Icon } from './_icon'
import Link from 'next/link'

export function Footer() {
	return (
		<footer className="px-4">
			<nav aria-label="Footer Navigation">
				<ul className="flex  items-center gap-4">
					<li className="flex-1">
						<Link scroll={true} href="/faq" className="hover:underline transition-colors text-sm text-neutral-400">
							FAQ
						</Link>
					</li>

					<li>
						<div className="w-[1px] h-3 bg-neutral-400" />
					</li>

					<li className="flex-1">
						<a
							href="https://discord.gg/FfmuN25GjE"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline transition-colors text-sm text-neutral-400"
						>
							Discord
						</a>
					</li>

					<li>
						<div className="w-[1px] h-3 bg-neutral-400" />
					</li>

					<li className="flex-1">
						<a
							href="https://t.me/+oHFpt8HM6EAyODFk"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline transition-colors text-sm text-neutral-400"
						>
							Telegram
						</a>
					</li>

					<li>
						<div className="w-[1px] h-3 bg-neutral-400" />
					</li>

					<li className="flex-1">
						<a
							href="https://discord.gg/FfmuN25GjE"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline transition-colors text-sm text-neutral-400 pointer-events-none"
						>
							Twitter
						</a>
					</li>
				</ul>
			</nav>
		</footer>
	)
}
