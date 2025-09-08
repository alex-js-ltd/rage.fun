import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { AuthSchema } from './utils/schemas'
import { getUser } from './data/get_user'

export const { auth, signIn, signOut } = NextAuth({
	...authConfig,
	providers: [
		Credentials({
			async authorize(credentials) {
				const parsedCredentials = AuthSchema.safeParse(credentials)

				if (parsedCredentials.success) {
					const { publicKey } = parsedCredentials.data

					const user = await getUser(publicKey.toBase58())

					if (!user) return null

					console.log(user)
					return user
				}

				console.log('Invalid credentials')
				return null
			},
		}),
	],
})
