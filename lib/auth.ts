import NextAuth, { CredentialsSignin } from 'next-auth';
import NeonAdapter from '@auth/neon-adapter';
import { Pool } from '@neondatabase/serverless';
import Credentials from 'next-auth/providers/credentials';
import Resend from 'next-auth/providers/resend';
import { authConfig } from '@/lib/auth.config';
import {
  clientIp,
  decideSignIn,
  normaliseEmail,
  rateLimitError
} from '@/lib/credentials';
import { enrolInDefaultLeague } from '@/lib/leagues';
import {
  clearAttemptsForEmail,
  recentAttempts,
  recordAttempt
} from '@/lib/sign-in-attempts';
import { findUserByEmail, passwordMatches } from '@/lib/users';

declare module 'next-auth' {
  interface User {
    user_name?: string | null;
  }
}

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

// Carries the refusal reason to the sign-in form.
export class SignInRefused extends CredentialsSignin {
  constructor(readonly reason: string) {
    super();
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: NeonAdapter(pool),
  providers: [
    //   GitHub,
    //   Google,
    Resend({
      // If your environment variable is named differently than default
      apiKey: process.env.AUTH_RESEND_KEY,
      from: 'noreply@lmsiq.co.uk',
      name: 'Email'
    }),
    Credentials({
      name: 'Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, request) {
        const email = normaliseEmail(String(credentials.email ?? ''));
        const password = String(credentials.password ?? '');
        const ip = clientIp(request.headers);

        const now = new Date();
        // Record before the count, so parallel requests count each other.
        await recordAttempt(email, ip);
        const limited = rateLimitError(
          await recentAttempts(email, ip, now),
          now
        );
        if (limited) throw new SignInRefused(limited);

        const user = email ? await findUserByEmail(email) : null;
        const matches = await passwordMatches(
          password,
          user?.passwordHash ?? null
        );
        const decision = decideSignIn(user, matches);
        if (!decision.allow) throw new SignInRefused(decision.reason);
        const { id, email: userEmail, name, image } = decision.user;
        return { id, email: userEmail, name, image };
      }
    })
  ],
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await enrolInDefaultLeague(user.id);
    },
    // Either auth method proves the account, so both clear the failed attempts.
    async signIn({ user }) {
      if (user.email) await clearAttemptsForEmail(user.email);
    }
  }
});
