import React from 'react'
import { Icon } from './_icon'
import Link from 'next/link'

export function Footer() {
	return (
		<footer className="px-0">
			<ul className="flex  items-center justify-center ">
				<li className="flex-1 flex justify-center">
					<Link scroll={true} href="/faq" className="hover:underline transition-colors text-xs text-neutral-400">
						FAQ
					</Link>
				</li>

				<li>
					<div className="w-[1px] h-3 bg-neutral-400" />
				</li>

				<li className="flex-1 flex justify-center">
					<a
						href="https://discord.gg/FfmuN25GjE"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:underline transition-colors text-xs text-neutral-400"
					>
						Discord
					</a>
				</li>

				<li>
					<div className="w-[1px] h-3 bg-neutral-400" />
				</li>

				<li className="flex-1 flex justify-center">
					<a
						href="https://t.me/+oHFpt8HM6EAyODFk"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:underline transition-colors text-xs text-neutral-400"
					>
						Telegram
					</a>
				</li>

				<li>
					<div className="w-[1px] h-3 bg-neutral-400" />
				</li>

				<li className="flex-1 flex justify-center">
					<a
						href="https://x.com/letsragedotfun"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:underline transition-colors text-xs text-neutral-400 "
					>
						Twitter
					</a>
				</li>
			</ul>
		</footer>
	)
}
