import { describe, expect, it, vi } from 'vitest';

const leakingSpy = vi.fn();

describe('setup.js mock lifecycle', () => {
  it('records calls made in the first test', () => {
    leakingSpy('first');
    expect(leakingSpy).toHaveBeenCalledTimes(1);
  });

  it('starts fresh on the next test because cleanup clears mocks', () => {
    expect(leakingSpy).toHaveBeenCalledTimes(0);
  });
});
