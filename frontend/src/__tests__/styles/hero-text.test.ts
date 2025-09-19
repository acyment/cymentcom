import fs from 'node:fs';
import path from 'node:path';

describe('Hero heading type scale', () => {
  it('keeps desktop size without mobile override', () => {
    const scssPath = path.resolve(__dirname, '../../../public/css/_hero.scss');
    const contents = fs.readFileSync(scssPath, 'utf8');

    expect(contents).toMatch(/\.HeroText\s*\{[\s\S]*?font-size:\s*2\.6vw;/);
    expect(contents).not.toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.HeroText\s*\{/,
    );
  });
});
