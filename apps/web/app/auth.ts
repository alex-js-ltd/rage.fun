import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Discord from 'next-auth/providers/discord'
import { authConfig } from '@/app/auth.config'
import { AuthSchema } from '@/app/utils/schemas'
import { getUser } from '@/app/data/get_user'
import { getIsCreator } from '@/app/data/get_is_creator'
import { SigninMessage } from '@/app/utils/sign_in'
import { getServerEnv } from '@/app/utils/env'
import { linkDiscordAccount, assignCreatorRole } from '@/app/webhook/discord'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/app/utils/db'

const { AUTH_DISCORD_ID, AUTH_DISCORD_SECRET } = getServerEnv()

export const { auth, signIn, signOut, handlers } = NextAuth({
	...authConfig,

	trustHost: true,
	adapter: PrismaAdapter(prisma),
	session: { strategy: 'jwt' },

	providers: [
		Credentials({
			async authorize(credentials) {
				const parse = AuthSchema.safeParse(credentials)

				if (parse.error) return null

				const { domain, publicKey, nonce, statement, signature } = parse.data

				const signinMessage = new SigninMessage({ domain, publicKey, nonce, statement })

				const validationResult = await signinMessage.validate(signature)

				if (!validationResult) throw new Error('Could not validate the signed message')

				const id = signinMessage.publicKey

				const user = await getUser(id)

				return user
			},
		}),

		// 2. Discord provider (new)
		Discord({
			clientId: AUTH_DISCORD_ID,
			clientSecret: AUTH_DISCORD_SECRET,
		}),
	],

	events: {
		async signIn({ user, account, profile }) {
			// Only run this logic for Discord logins

			console.log('user', user)

			console.log('account', account)
			if (account?.provider === 'discord' && profile?.id) {
				try {
					const session = await auth()

					if (!session?.user?.id) return

					await linkDiscordAccount(profile.id, session?.user?.id)

					const isCreator = await getIsCreator(session?.user?.id)
					if (isCreator) {
						await assignCreatorRole(profile.id)
					}

					console.log(`✅ Linked and updated Discord user ${profile.id}`)
				} catch (error) {
					console.error('❌ Discord link/update failed', error)
				}
			}
		},
	},

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
})
