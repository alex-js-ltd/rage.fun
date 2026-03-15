import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import { authConfig } from "@/app/auth.config";
import { AuthSchema } from "@/app/utils/schemas";
import { getUser } from "@/app/data/get_user";
import { getIsCreator } from "@/app/data/get_is_creator";
import { SigninMessage } from "@/app/utils/sign_in";
import { getServerEnv } from "@/app/utils/env";
import {
  linkDiscordAccount,
  assignCreatorRole,
  addUserToGuild,
} from "@/app/webhooks/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@repo/database";

const { AUTH_DISCORD_ID, AUTH_DISCORD_SECRET } = getServerEnv();

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,

  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      async authorize(credentials) {
        const parse = AuthSchema.safeParse(credentials);

        if (parse.error) return null;

        const { domain, publicKey, nonce, statement, signature } = parse.data;

        const signinMessage = new SigninMessage({
          domain,
          publicKey,
          nonce,
          statement,
        });

        const validationResult = await signinMessage.validate(signature);

        if (!validationResult)
          throw new Error("Could not validate the signed message");

        const id = signinMessage.publicKey;

        const user = await getUser(id);

        return user;
      },
    }),

    // 2. Discord provider (new)
    Discord({
      clientId: AUTH_DISCORD_ID,
      clientSecret: AUTH_DISCORD_SECRET,

      authorization: {
        params: {
          scope: "identify email guilds.join", // 👈 add guilds.join here
        },
      },
    }),
  ],

  events: {
    async linkAccount({ user, account, profile }) {
      console.log("----------------------------------------");
      console.log("🧩  DISCORD LINK EVENT");
      console.log("----------------------------------------");

      console.log("👤  User:");
      console.dir(user, { depth: null, colors: true });

      console.log("💠  Account:");
      console.dir(account, { depth: null, colors: true });

      console.log("🪪  Profile:");
      console.dir(profile, { depth: null, colors: true });

      console.log("----------------------------------------\n");

      if (account?.provider === "discord" && account && user.id) {
        try {
          await linkDiscordAccount(account, user?.id);

          if (account.access_token) {
            await addUserToGuild(
              account.providerAccountId,
              account?.access_token,
            );
          }

          const isCreator = await getIsCreator(user?.id);

          if (isCreator) {
            await assignCreatorRole(account.providerAccountId);
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              image: profile.image ?? undefined,
              name: profile.name ?? undefined,
              email: profile.email ?? undefined,
            },
          });

          console.log(`✅ Linked and updated Discord user ${profile.id}`);
        } catch (error) {
          console.error("❌ Discord link/update failed", error);
        }
      }
    },
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      return isLoggedIn;
    },

    // ✅ Expose public key in session.user.id
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
