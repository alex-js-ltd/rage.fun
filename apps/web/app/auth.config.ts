import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
	pages: {
		signIn: '/',
	},
	providers: [
		// added later in auth.ts since it requires bcrypt which is only compatible with Node.js
		// while this file is also used in non-Node.js environments
	],
	trustHost: true,
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user

			return isLoggedIn
		},

		// ✅ Expose public key in session.user.id
		async session({ session, token }) {
			if (token?.sub) {
				session.user.id = token.sub
			}
			return session
		},
	},
} satisfies NextAuthConfig
