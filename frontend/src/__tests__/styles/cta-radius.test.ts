import fs from 'node:fs';
import path from 'node:path';

describe('CTA radius token', () => {
  it('uses the current fixed token value', () => {
    const scssPath = path.resolve(
      __dirname,
      '../../../public/css/_variables.scss',
    );
    const contents = fs.readFileSync(scssPath, 'utf8');

    expect(contents).toMatch(/\$radius-cta:\s*1\.3vw\s*;/);
  });
});
