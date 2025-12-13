import NextAuth from 'next-auth';
import NeonAdapter from '@auth/neon-adapter';
import { Pool } from '@neondatabase/serverless';
import Resend from 'next-auth/providers/resend';

declare global {
  // Reuse the pool across hot reloads to avoid exhausting connections
  // eslint-disable-next-line no-var
  var _authPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;
const pool = globalThis._authPool ?? new Pool({ connectionString });
if (!globalThis._authPool) {
  globalThis._authPool = pool;
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  return {
    adapter: NeonAdapter(pool),
    providers: [
      //   GitHub,
      //   Google,
      Resend({
        // If your environment variable is named differently than default
        apiKey: process.env.AUTH_RESEND_KEY,
        from: 'noreply@lmsiq.co.uk',
        name: 'Email'
      })
    ],
    pages: {
      newUser: '/' // redirects on login
    },
    session: {
      maxAge: 60 * 60 * 24 // 1 day in seconds
    },
    callbacks: {
      async jwt({ token, user }) {
        // Persist user id onto the token so session can expose it
        if (user?.id) token.id = user.id;
        return token;
      },
      async session({ session, token }) {
        // Copy id from token onto the session user
        if (session.user && token?.id) {
          session.user.id = token.id as string;
        }
        return session;
      },
      async redirect({ url, baseUrl }) {
        // Always redirect to homepage after sign-in
        return baseUrl;
      },
      async signIn({ user, account, profile }) {
        // Only merge if emails match
        if (
          account &&
          account.provider === 'google' &&
          profile &&
          profile.email !== user.email
        ) {
          // Prevent automatic merging
          return true; // allow sign in
        }

        return true; // default behavior
      }
    }
  };
});
