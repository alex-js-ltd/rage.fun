import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/app/utils/misc'

export function Avatar({ publicKey, className, ...props }: { publicKey: string } & AvatarPrimitive.AvatarProps) {
	const avatarUrl = `https://api.dicebear.com/9.x/identicon/svg?seed=${publicKey}`

	return (
		<AvatarPrimitive.Root
			className={cn(
				'inline-flex size-5 select-none items-center justify-center overflow-hidden rounded-full align-middle',
				className,
			)}
			{...props}
		>
			<AvatarPrimitive.Image className="size-full rounded-[inherit] object-cover" src={avatarUrl} alt="User Avatar" />
			<AvatarPrimitive.Fallback
				className="leading-1 flex size-full items-center justify-center bg-gray-300 text-[15px] font-medium text-gray-700"
				delayMs={600}
			>
				{publicKey.slice(0, 2).toUpperCase()} {/* Fallback: First two letters */}
			</AvatarPrimitive.Fallback>
		</AvatarPrimitive.Root>
	)
}
