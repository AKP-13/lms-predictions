import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// The edge runtime cannot load bcrypt, so the middleware uses the config without the providers.
export const { auth: middleware } = NextAuth(authConfig);

// Don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
