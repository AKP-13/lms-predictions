import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ErrorPage from './error';

describe('the error page', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('tells the player in words and tries again on a click', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reset = vi.fn();
    render(<ErrorPage error={new Error('boom')} reset={reset} />);

    expect(
      screen.getByRole('heading', { name: 'Something went wrong' })
    ).toBeVisible();
    expect(screen.queryByText(/CREATE TABLE/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
