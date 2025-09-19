import fs from 'node:fs';
import path from 'node:path';

describe('Hero copy width', () => {
  it('keeps 30% width without mobile override', () => {
    const scssPath = path.resolve(__dirname, '../../../public/css/_hero.scss');
    const contents = fs.readFileSync(scssPath, 'utf8');

    expect(contents).toMatch(/\.HeroCopy\s*\{[\s\S]*?width:\s*30%;/);
    expect(contents).not.toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.HeroCopy\s*\{/,
    );
  });
});
