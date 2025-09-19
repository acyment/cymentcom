import fs from 'node:fs';
import path from 'node:path';

describe('Hero accordion button', () => {
  it('is hidden on mobile', () => {
    const scssPath = path.resolve(__dirname, '../../../public/css/_hero.scss');
    const contents = fs.readFileSync(scssPath, 'utf8');

    expect(contents).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.CircleButton\s*\{\s*display:\s*none;/,
    );
  });
});
