import { ConnectWallet } from '@/app/comps/connect_wallet'
import { Button } from './button'

import { Icon } from './_icon'

export function Header() {
	return (
		<div className="sticky top-0 z-20">
			<header className="flex w-full flex-col gap-3 bg-secondary-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-secondary-background/60 md:h-16 md:flex-row md:items-center lg:px-4">
				<div className="flex w-full items-center gap-8">
					<div className="flex items-center gap-2"></div>
					<div className="ml-auto flex items-center gap-2 sm:gap-4 px-3 overflow-hidden [&>*]:overflow-hidden">
						<ConnectWallet overrideContent={<Button variant="connect">Connect</Button>} currentUserClassName="button" />
					</div>
				</div>
			</header>
		</div>
	)
}
