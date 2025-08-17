import NextAuth from 'next-auth';
import NeonAdapter from '@auth/neon-adapter';
import { Pool } from '@neondatabase/serverless';
import GitHub from 'next-auth/providers/github';
import Resend from 'next-auth/providers/resend';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  // Create a `Pool` inside the request handler.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return {
    adapter: NeonAdapter(pool),
    providers: [
      GitHub,
      Google,
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
    callbacks: {
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
