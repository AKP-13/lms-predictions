// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { splitHash } from './breach-check';
import { newPasswordError } from './passwords';

const LONG_ENOUGH = 'correct horse battery staple';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('newPasswordError', () => {
  it('rejects a short password without asking the breach service', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const error = await newPasswordError('short');

    expect(error).toBe('Password must be at least 12 characters.');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects a long password that the breach service knows', async () => {
    stubRange(`${splitHash(LONG_ENOUGH).suffix}:7`, 200);

    const error = await newPasswordError(LONG_ENOUGH);

    expect(error).toContain('data breach');
  });

  it('accepts a long password that the breach service does not know', async () => {
    stubRange('0000000000000000000000000000000000A:3', 200);

    expect(await newPasswordError(LONG_ENOUGH)).toBeNull();
  });

  it('accepts a long password when the breach service does not answer', async () => {
    stubRange('', 503);

    expect(await newPasswordError(LONG_ENOUGH)).toBeNull();
  });
});

function stubRange(body: string, status: number): void {
  vi.stubGlobal('fetch', async () => new Response(body, { status }));
}
