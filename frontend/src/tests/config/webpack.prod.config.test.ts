import { beforeEach, afterAll, describe, expect, it, vi } from 'vitest';

const PROD_CONFIG_PATH = '../../../../webpack/prod.config.js';

const loadProdConfig = () => {
  const modulePath = require.resolve(PROD_CONFIG_PATH);
  delete require.cache[modulePath];
  return require(PROD_CONFIG_PATH);
};

const hasRsdoctorPlugin = (config: { plugins?: unknown[] }) => {
  return (config.plugins ?? []).some(
    (plugin) => plugin?.constructor?.name === 'RsdoctorRspackPlugin',
  );
};

describe('webpack production diagnostics toggle', () => {
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
    const config = loadProdConfig();
    expect(hasRsdoctorPlugin(config)).toBe(false);
  });

  it('includes Rsdoctor when ENABLE_RSDOCTOR is truthy', () => {
    process.env.ENABLE_RSDOCTOR = 'true';
    const config = loadProdConfig();
    expect(hasRsdoctorPlugin(config)).toBe(true);
  });
});
