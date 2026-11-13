import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { AdminLink } from './admin-link';

afterEach(cleanup);

describe('AdminLink', () => {
  it('links to the Admin page', () => {
    render(<AdminLink />);
    expect(
      screen.getByRole('link', { name: /open the admin page/i })
    ).toHaveAttribute('href', '/admin');
  });
});
