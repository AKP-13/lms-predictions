import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { FormError } from './form-error';

describe('FormError', () => {
  afterEach(cleanup);

  it('announces the error in words', () => {
    render(<FormError message="Wrong email or password." />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      /^Wrong email or password\.$/
    );
  });

  it('marks the error with a hidden icon, so it does not depend on colour', () => {
    render(<FormError message="Wrong email or password." />);

    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows nothing without a message', () => {
    render(<FormError message={null} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
