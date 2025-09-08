import React from 'react'
import { Icon } from './_icon'
import Link from 'next/link'

export function Footer() {
	return (
		<footer className="fixed bottom-0 right-0 z-50 items-center justify-between px-4 pt-1 text-white hidden sm:inline-flex pb-2">
			<nav className="flex items-center gap-2.5 rounded-full text-xs font-medium">
				<Link className="text-text-100 hover:text-text-200 transition duration-300 ease-in-out" href="/faq">
					FAQ
				</Link>

				<Link
					href={`https://x.com/magicmint_fun`}
					target="_blank"
					rel="noopener noreferrer"
					className="size-6 flex items-center justify-center transition duration-300 ease-in-out"
				>
					<Icon
						name="twitter"
						className="size-3 text-text-100 hover:text-gray-200 transition duration-300 ease-in-out"
					/>
				</Link>

				<Link
					href={`https://t.me/magicmintdotfun`}
					target="_blank"
					rel="noopener noreferrer"
					className="size-6 flex items-center justify-center transition duration-300 ease-in-out"
				>
					<Icon
						name="telegram"
						className="size-4 text-text-100 hover:text-[#0088CC] hover:bg-white overflow-hidden rounded-full transition duration-300 ease-in-out"
					/>
				</Link>

				<Link
					href={`https://discord.gg/F66a7SbBD8`}
					target="_blank"
					rel="noopener noreferrer"
					className="size-6 flex items-center justify-center transition duration-300 ease-in-out"
				>
					<Icon
						name="discord"
						className="size-4 text-text-100 hover:text-[#5865F2] overflow-hidden rounded-full transition duration-300 ease-in-out"
					/>
				</Link>
			</nav>
		</footer>
	)
}
