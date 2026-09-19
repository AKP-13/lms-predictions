import type { NextAuthConfig } from 'next-auth';

// The middleware runs this on the edge runtime, so keep the adapter, the providers and bcrypt out.
export const authConfig = {
  providers: [],
  pages: {
    newUser: '/' // where a new user lands after the first sign-in
  },
  session: {
    strategy: 'jwt', // required by the Credentials provider; see ADR 0001
    maxAge: 60 * 60 * 24 // 1 day in seconds
  },
  callbacks: {
    async jwt({ token, user }) {
      // The adapter returns the id as a number; the password path returns a string.
      if (user?.id) token.id = String(user.id);
      return token;
    },
    async session({ session, token }) {
      // Copy the id from the token onto the session user
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to the homepage after sign-in
      return baseUrl;
    }
  }
} satisfies NextAuthConfig;
