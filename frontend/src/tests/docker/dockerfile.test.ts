import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const DOCKERFILE_PATH = 'compose/production/django/Dockerfile';

describe('production Dockerfile', () => {
  it('copies pnpm-lock.yaml before running pnpm install', () => {
    const dockerfile = readFileSync(DOCKERFILE_PATH, 'utf8');

    expect(dockerfile).toMatch(/COPY\s+\.\/pnpm-lock\.yaml\s+\$\{APP_HOME}/);
  });
});
