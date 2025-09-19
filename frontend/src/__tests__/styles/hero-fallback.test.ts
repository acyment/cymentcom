import fs from 'node:fs';
import path from 'node:path';

describe('Hero spacing fallback', () => {
  it('defines default spacing tokens inside the partial', () => {
    const scssPath = path.resolve(__dirname, '../../../public/css/_hero.scss');
    const contents = fs.readFileSync(scssPath, 'utf8');

    expect(contents).toMatch(/\$main-padding-left:\s*8vw\s*!default;/);
    expect(contents).toMatch(
      /\$negative-main-padding-left:\s*-\(\$main-padding-left\)\s*!default;/,
    );
  });
});
