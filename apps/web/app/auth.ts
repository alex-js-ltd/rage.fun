import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { AuthSchema } from './utils/schemas'
import { getUser } from './data/get_user'
import { SigninMessage } from '@/app/utils/sign_in'

export const { auth, signIn, signOut } = NextAuth({
	...authConfig,
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
	],
})
