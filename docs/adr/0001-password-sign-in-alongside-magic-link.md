# Password sign-in alongside magic link

We added password as a second sign-in method next to the existing magic-link email flow, so a user who dislikes waiting on an email can sign in directly. Both methods point at the same `users` row — password is not modeled as a separate "account" link, because it isn't a third-party identity like an OAuth provider is. Email verification stays the one trust anchor every account needs: a password-only signup must click a verification link before the password works, and password reset reuses that same link rather than a second token system. This forced a switch from Auth.js's default database-session strategy to explicit JWT sessions, since the Credentials provider (the standard route for username/password login) works cleanly with JWT but not database sessions.

Password length has an upper bound of 72 bytes because bcrypt reads 72 bytes and ignores the rest. We refuse a longer password rather than hash a silently truncated one, so nobody believes in strength the hash never saw. The bound counts bytes, not characters, because a character can cost up to four bytes.

Considered and rejected: a separate "credentials account" row matching Auth.js's provider-account pattern (adds a join for no benefit — a password isn't a third-party identity); keeping database sessions and writing custom glue for Credentials (more code for the same result).
