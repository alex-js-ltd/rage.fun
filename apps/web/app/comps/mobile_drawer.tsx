import { ReactNode } from 'react'
import { DialogRoot, DialogContent, DialogPortal, DialogTitle, DialogTrigger } from './dialog'

export function MobileDrawer({ trigger, content }: { trigger: ReactNode; content: ReactNode }) {
	return (
		<DialogRoot>
			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent className="absolute bottom-[52px] sm:bottom-0 w-full max-w-[600px] h-auto frost z-50 p-10">
				<DialogTitle className="sr-only">Drawer</DialogTitle>

				{content}
			</DialogContent>
		</DialogRoot>
	)
}
