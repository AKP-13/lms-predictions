import { afterEach, describe, expect, it, vi } from 'vitest';
import { isAdminEmail } from './admin';

afterEach(() => vi.unstubAllEnvs());

describe('isAdminEmail', () => {
  it('accepts the admin address in any letter case', () => {
    vi.stubEnv('NEXT_PUBLIC_MY_EMAIL_ADDRESS', 'Admin@Example.com');
    expect(isAdminEmail('admin@example.com')).toBe(true);
  });

  it('refuses another address', () => {
    vi.stubEnv('NEXT_PUBLIC_MY_EMAIL_ADDRESS', 'admin@example.com');
    expect(isAdminEmail('player@example.com')).toBe(false);
  });

  it('refuses a missing address', () => {
    vi.stubEnv('NEXT_PUBLIC_MY_EMAIL_ADDRESS', 'admin@example.com');
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it('refuses every address when no admin is set', () => {
    vi.stubEnv('NEXT_PUBLIC_MY_EMAIL_ADDRESS', '');
    expect(isAdminEmail('')).toBe(false);
    expect(isAdminEmail('player@example.com')).toBe(false);
  });
});
