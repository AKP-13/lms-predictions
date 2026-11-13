import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const { auth, redirect } = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  })
}));

vi.mock('@/lib/auth', () => ({ auth }));
vi.mock('next/navigation', () => ({ redirect }));

import AdminPage from './page';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_MY_EMAIL_ADDRESS', 'admin@example.com');
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('Admin page', () => {
  it('shows the heading to the admin', async () => {
    auth.mockResolvedValue({ user: { email: 'admin@example.com' } });
    render(await AdminPage());
    expect(
      screen.getByRole('heading', { level: 1, name: 'Admin' })
    ).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('sends a signed-in user who is not the admin to the Home page', async () => {
    auth.mockResolvedValue({ user: { email: 'player@example.com' } });
    await expect(AdminPage()).rejects.toThrow('redirect:/');
  });

  it('sends a visitor with no session to the Home page', async () => {
    auth.mockResolvedValue(null);
    await expect(AdminPage()).rejects.toThrow('redirect:/');
  });
});
