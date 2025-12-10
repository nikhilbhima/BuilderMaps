import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";
import LinkedIn from "next-auth/providers/linkedin";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === "development",
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      client: { token_endpoint_auth_method: "client_secret_post" },
      issuer: "https://www.linkedin.com",
      wellKnown: "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      authorization: {
        url: "https://www.linkedin.com/oauth/v2/authorization",
        params: {
          scope: "profile email openid",
          prompt: "consent",
          response_type: "code",
        },
      },
      token: {
        url: "https://www.linkedin.com/oauth/v2/accessToken",
      },
      userinfo: {
        url: "https://api.linkedin.com/v2/userinfo",
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      // For OAuth providers, create or update user in database
      if (account.provider === "twitter" || account.provider === "linkedin") {
        const provider = account.provider === "twitter" ? "x" : "linkedin";
        const existingUser = await db.query.users.findFirst({
          where: eq(users.id, user.id!),
        });

        if (!existingUser) {
          await db.insert(users).values({
            id: user.id!,
            email: user.email || undefined,
            handle: user.name || user.id!,
            displayName: user.name,
            avatarUrl: user.image,
            provider,
          });
        } else {
          await db
            .update(users)
            .set({
              displayName: user.name,
              avatarUrl: user.image,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id!));
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;

        // Fetch user from database to get additional info
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.sub),
        });

        if (dbUser) {
          session.user.handle = dbUser.handle;
          session.user.provider = dbUser.provider as "x" | "linkedin";
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
  },
  pages: {
    signIn: "/", // Use custom modal instead of separate page
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});

// Extend the session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      handle?: string;
      provider?: "x" | "linkedin";
    };
  }
}
