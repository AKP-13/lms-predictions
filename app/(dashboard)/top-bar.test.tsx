import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import type { Session } from 'next-auth';
import { TopBar } from './top-bar';

const location = vi.hoisted(() => ({ pathname: '/', search: '' }));

vi.mock('next/navigation', () => ({
  usePathname: () => location.pathname,
  useSearchParams: () => new URLSearchParams(location.search)
}));

const session: Session = {
  user: { id: '1', email: 'player@example.com' },
  expires: '2099-01-01T00:00:00.000Z'
};

function renderAt(url: string, session: Session | null) {
  const [pathname, search = ''] = url.split('?');
  location.pathname = pathname;
  location.search = search;
  render(<TopBar session={session} />);
}

function tabs() {
  return within(screen.getByRole('navigation', { name: 'Main' }));
}

describe('TopBar', () => {
  afterEach(cleanup);

  it('lists Home, Planner, Results and Account for a signed-in player', () => {
    renderAt('/', session);

    expect(
      tabs()
        .getAllByRole('link')
        .map((link) => [link.textContent, link.getAttribute('href')])
    ).toEqual([
      ['Home', '/'],
      ['Planner', '/?tab=planner'],
      ['Results', '/?tab=results'],
      ['Account', '/account']
    ]);
  });

  it('does not list Account for a signed-out visitor', () => {
    renderAt('/', null);

    expect(
      tabs()
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Home', 'Planner', 'Results']);
  });

  it.each([
    ['/', 'Home'],
    ['/?tab=planner', 'Planner'],
    ['/?tab=results', 'Results'],
    ['/?tab=fixtures', 'Home'],
    ['/?tab=injuries', 'Home'],
    ['/?tab=table', 'Home'],
    ['/?tab=this-week', 'Home'],
    ['/account', 'Account']
  ])('marks %s as %s', (url, label) => {
    renderAt(url, session);

    const current = tabs()
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page');

    expect(current.map((link) => link.textContent)).toEqual([label]);
  });

  it('shows Sign out to a signed-in player', () => {
    renderAt('/', session);

    expect(
      screen.getByRole('button', { name: 'Sign out' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sign in' })
    ).not.toBeInTheDocument();
  });

  it('shows Sign in to a signed-out visitor', () => {
    renderAt('/', null);

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sign out' })
    ).not.toBeInTheDocument();
  });

  it('shows a logo that goes to Home', () => {
    renderAt('/?tab=planner', session);

    expect(screen.getByRole('link', { name: 'LPS' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('shows "Last Player Standing" as the heading', () => {
    renderAt('/', null);

    expect(screen.getByText('Last Player Standing')).toBeInTheDocument();
  });

  it.each([
    ['signed out', null],
    ['signed in', session]
  ])('has no link to # when %s', (_, session) => {
    renderAt('/', session);

    for (const link of screen.getAllByRole('link')) {
      expect(link.getAttribute('href')).not.toBe('#');
    }
  });

  it('marks no item on a page outside the tabs', () => {
    renderAt('/privacy', session);

    for (const link of tabs().getAllByRole('link')) {
      expect(link).not.toHaveAttribute('aria-current');
    }
  });
});
