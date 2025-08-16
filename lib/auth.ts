import NextAuth from 'next-auth';
import NeonAdapter from '@auth/neon-adapter';
import { Pool } from '@neondatabase/serverless';
import GitHub from 'next-auth/providers/github';
import Resend from 'next-auth/providers/resend';

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  // Create a `Pool` inside the request handler.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return {
    adapter: NeonAdapter(pool),
    providers: [
      GitHub,
      Resend({
        // If your environment variable is named differently than default
        apiKey: process.env.AUTH_RESEND_KEY,
        from: 'noreply@lmsiq.co.uk'
      })
    ],
    pages: {
      signIn: '/login', // where your login form lives
      //   signOut: '/', // after logging out
      //   error: '/login', // error page
      //   verifyRequest: '/verify', // (optional) "Check your email" page
      newUser: '/' // (optional) first login
    },
    callbacks: {
      async redirect({ url, baseUrl }) {
        // Always redirect to homepage after sign-in
        return baseUrl;
      }
    }
  };
});
