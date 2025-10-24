'use client'

import { ReactNode } from 'react'
import { useSession, SessionProvider } from 'next-auth/react'

export function AuthProvider(props: { children: ReactNode }) {
	return <SessionProvider>{props.children}</SessionProvider>
}
