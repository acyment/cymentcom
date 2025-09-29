import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const DEV_CONFIG_PATH = '../../../../webpack/dev.config.js';

const loadDevConfig = () => {
  const modulePath = require.resolve(DEV_CONFIG_PATH);
  delete require.cache[modulePath];
  return require(DEV_CONFIG_PATH);
};

const hasRsdoctorPlugin = (config: { plugins?: unknown[] }) => {
  return (config.plugins ?? []).some(
    (plugin) => plugin?.constructor?.name === 'RsdoctorRspackPlugin',
  );
};

describe('webpack development diagnostics toggle', () => {
  const originalFlag = process.env.ENABLE_RSDOCTOR;

  beforeEach(() => {
    vi.resetModules();
    if (originalFlag === undefined) {
      delete process.env.ENABLE_RSDOCTOR;
    } else {
      process.env.ENABLE_RSDOCTOR = originalFlag;
    }
  });

  afterAll(() => {
    if (originalFlag === undefined) {
      delete process.env.ENABLE_RSDOCTOR;
    } else {
      process.env.ENABLE_RSDOCTOR = originalFlag;
    }
  });

  it('does not include Rsdoctor by default', () => {
    const config = loadDevConfig();
    expect(hasRsdoctorPlugin(config)).toBe(false);
  });

  it('includes Rsdoctor when ENABLE_RSDOCTOR is truthy', () => {
    process.env.ENABLE_RSDOCTOR = 'true';
    const config = loadDevConfig();
    expect(hasRsdoctorPlugin(config)).toBe(true);
  });
});
