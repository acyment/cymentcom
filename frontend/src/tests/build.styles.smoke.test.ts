import { describe, it, expect } from 'vitest';
import { compile } from 'sass';
import path from 'path';

// Lightweight smoke test to ensure SCSS entry compiles.
// Catches undefined variables, bad import order, and missing packages.
describe('styles.scss build smoke', () => {
  it('compiles without Sass errors', () => {
    const scssEntry = path.resolve(
      process.cwd(),
      'frontend/public/css/styles.scss',
    );

    const result = compile(scssEntry, {
      // Resolve imports from node_modules and local css dir
      loadPaths: [
        path.resolve(process.cwd(), 'node_modules'),
        path.resolve(process.cwd(), 'frontend/public/css'),
      ],
      style: 'compressed',
      sourceMap: false,
    });

    expect(result.css.length).toBeGreaterThan(0);
  });
});
