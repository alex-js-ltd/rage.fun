import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
export function ToastProvider(props: { children: React.ReactNode }) {
	return (
		<ToastPrimitive.Provider swipeDirection="left">
			{props.children}
			<ToastPrimitive.Viewport className="fixed bottom-0 left-0 sm:p-4 p-6 flex m-0 list-none z-50 w-fit h-auto sm:max-w-[576px] max-w-full" />
		</ToastPrimitive.Provider>
	)
}
