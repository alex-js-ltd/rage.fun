import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
export function ToastProvider(props: { children: React.ReactNode }) {
	return (
		<ToastPrimitive.Provider swipeDirection="left">
			{props.children}
			<ToastPrimitive.Viewport className="fixed bottom-0 left-0 z-50 m-0 flex h-auto w-fit max-w-full list-none p-6 sm:max-w-[576px] sm:p-4" />
		</ToastPrimitive.Provider>
	)
}
