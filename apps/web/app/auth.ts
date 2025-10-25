import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Discord from 'next-auth/providers/discord'
import { authConfig } from './auth.config'
import { AuthSchema } from './utils/schemas'
import { getUser } from './data/get_user'
import { SigninMessage } from '@/app/utils/sign_in'

import { getServerEnv } from './utils/env'

const { AUTH_DISCORD_ID, AUTH_DISCORD_SECRET } = getServerEnv()

export const { auth, signIn, signOut, handlers } = NextAuth({
	...authConfig,

	trustHost: true,

	session: { strategy: 'jwt' },
	providers: [
		Credentials({
			async authorize(credentials) {
				const parse = AuthSchema.safeParse(credentials)
				console.log(parse)
				if (parse.error) return null

				const { domain, publicKey, nonce, statement, signature } = parse.data

				const signinMessage = new SigninMessage({ domain, publicKey, nonce, statement })

				const validationResult = await signinMessage.validate(signature)

				console.log('validation result', validationResult)

				console.log('sign in message', signinMessage)

				if (!validationResult) throw new Error('Could not validate the signed message')
				console.log(signinMessage)
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
				// NextAuth wants *something* shaped like a user here.
				// We're not using this as our "real" user identity,
				// we're just harvesting Discord info later.

				console.log('discord profile', discordProfile)
				return {
					id: discordProfile.id,
					name: discordProfile.username,
					image: discordProfile.avatar
						? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
						: null,
				}
			},
		}),
	],
})
