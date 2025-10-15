import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const COMMON_CONFIG_PATH = '../../../../webpack/common.config.js';

const loadCommonConfig = () => {
  const modulePath = require.resolve(COMMON_CONFIG_PATH);
  delete require.cache[modulePath];
  return require(COMMON_CONFIG_PATH);
};

type LoaderLike = { loader?: unknown; use?: unknown };

const extractLoaderNames = (rule: LoaderLike): string[] => {
  if (typeof rule.loader === 'string') {
    return [rule.loader];
  }

  const { use } = rule;
  if (!use) {
    return [];
  }

  if (typeof use === 'string') {
    return [use];
  }

  if (Array.isArray(use)) {
    return use.filter((value): value is string => typeof value === 'string');
  }

  return [];
};

describe('webpack common TypeScript handling', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('transpiles TypeScript via swc-loader', () => {
    const config = loadCommonConfig();
    const swcRule = (config.module?.rules ?? []).find((rule: LoaderLike) =>
      extractLoaderNames(rule).includes('swc-loader'),
    );

    expect(swcRule).toBeDefined();
    expect(String(swcRule?.test ?? '')).toContain('ts');
  });

  it('no longer registers ts-loader', () => {
    const config = loadCommonConfig();
    const hasTsLoader = (config.module?.rules ?? []).some((rule: LoaderLike) =>
      extractLoaderNames(rule).some((name) => name.includes('ts-loader')),
    );

    expect(hasTsLoader).toBe(false);
  });

  it('configures SWC to parse TypeScript', () => {
    const swcrcPath = path.resolve(process.cwd(), '.swcrc');
    const swcrc = readFileSync(swcrcPath, 'utf8');
    expect(swcrc).toMatch(/"syntax"\s*:\s*"typescript"/);
  });
});
