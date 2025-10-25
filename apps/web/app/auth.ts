import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Discord from 'next-auth/providers/discord'
import { authConfig } from '@/app/auth.config'
import { AuthSchema } from '@/app/utils/schemas'
import { getUser } from '@/app/data/get_user'
import { SigninMessage } from '@/app/utils/sign_in'
import { getServerEnv } from '@/app/utils/env'
import { linkDiscordAccount, assignCreatorRole } from '@/app/webhook/discord'

const { AUTH_DISCORD_ID, AUTH_DISCORD_SECRET } = getServerEnv()

export const { auth, signIn, signOut, handlers } = NextAuth({
	...authConfig,

	trustHost: true,

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

			async profile(discordProfile) {
				if (!discordProfile?.id) return null

				const account = await linkDiscordAccount(discordProfile?.id)

				return discordProfile
			},
		}),
	],
})
