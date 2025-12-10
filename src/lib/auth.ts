import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";
import LinkedIn from "next-auth/providers/linkedin";

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
    // Simple signIn - just allow all OAuth logins
    async signIn() {
      return true;
    },
    // Store user info in session from token
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || token.id as string;
        session.user.handle = token.handle as string || token.name as string || "user";
        session.user.provider = token.provider as "x" | "linkedin";
      }
      return session;
    },
    // Store all user info in JWT token (no DB needed)
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      if (account) {
        token.provider = account.provider === "twitter" ? "x" : "linkedin";
      }
      // Use profile data for handle
      if (profile) {
        // Twitter provides username, LinkedIn provides name
        token.handle = (profile as { username?: string }).username || user?.name || "user";
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
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
