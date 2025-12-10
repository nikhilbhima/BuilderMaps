import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || user.handle,
          image: user.avatarUrl,
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
          session.user.provider = dbUser.provider as "x" | "linkedin" | "email";
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
      provider?: "x" | "linkedin" | "email";
    };
  }
}
