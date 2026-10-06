import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { Session } from 'next-auth';
import { MobileNav } from './mobile-nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/'
}));

const session: Session = {
  user: { id: '1', email: 'player@example.com' },
  expires: '2099-01-01T00:00:00.000Z'
};

function openSheet() {
  fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
  return screen.getByRole('dialog');
}

describe('MobileNav', () => {
  afterEach(cleanup);

  it('shows a logo that goes to the home page', () => {
    render(<MobileNav session={null} />);

    expect(screen.getByRole('link', { name: 'LPS' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('lists only Home for a signed-out visitor', () => {
    render(<MobileNav session={null} />);

    const sheet = openSheet();

    expect(
      within(sheet)
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Home']);
    expect(within(sheet).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('lists Home and Account for a signed-in player', () => {
    render(<MobileNav session={session} />);

    const sheet = openSheet();

    expect(
      within(sheet)
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Home', 'Account']);
    expect(
      within(sheet).getByRole('link', { name: 'Account' })
    ).toHaveAttribute('href', '/account');
  });

  it.each([
    ['signed out', null],
    ['signed in', session]
  ])('does not list Results when %s', (_, session) => {
    render(<MobileNav session={session} />);

    const sheet = openSheet();

    expect(
      within(sheet).queryByRole('link', { name: 'Results' })
    ).not.toBeInTheDocument();
  });

  it('shows a sign-in control to a signed-out visitor', () => {
    render(<MobileNav session={null} />);

    const sheet = openSheet();

    expect(
      within(sheet).getByRole('button', { name: 'Sign in' })
    ).toBeInTheDocument();
    expect(
      within(sheet).queryByRole('button', { name: 'Sign out' })
    ).not.toBeInTheDocument();
  });

  it('shows a sign-out control to a signed-in player', () => {
    render(<MobileNav session={session} />);

    const sheet = openSheet();

    expect(
      within(sheet).getByRole('button', { name: 'Sign out' })
    ).toBeInTheDocument();
    expect(
      within(sheet).queryByRole('button', { name: 'Sign in' })
    ).not.toBeInTheDocument();
  });

  it.each([
    ['signed out', null],
    ['signed in', session]
  ])('has no link to # when %s', (_, session) => {
    render(<MobileNav session={session} />);

    openSheet();

    for (const link of screen.getAllByRole('link', { hidden: true })) {
      expect(link.getAttribute('href')).not.toBe('#');
    }
  });

  it('marks the current page', () => {
    render(<MobileNav session={session} />);

    const sheet = openSheet();

    expect(within(sheet).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(
      within(sheet).getByRole('link', { name: 'Account' })
    ).not.toHaveAttribute('aria-current');
  });

  it('closes the sheet when the player taps a link', () => {
    render(<MobileNav session={session} />);

    const sheet = openSheet();
    fireEvent.click(within(sheet).getByRole('link', { name: 'Account' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
