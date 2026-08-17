import fs from 'node:fs';
import path from 'node:path';

describe('Hero copy width', () => {
  it('is a 30% overlay on desktop and stacks on narrow viewports', () => {
    const scssPath = path.resolve(__dirname, '../../../public/css/_hero.scss');
    const contents = fs.readFileSync(scssPath, 'utf8');

    // Desktop: copy floats over the hero image in a narrow column.
    expect(contents).toMatch(
      /\.HeroCopy\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?width:\s*30%;/,
    );

    // Mobile: the copy stacks above the image instead (f061894 "stack copy
    // above image on narrow viewports"). This override is deliberate; the test
    // used to assert it must not exist.
    expect(contents).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.HeroCopy\s*\{[\s\S]*?position:\s*static;[\s\S]*?width:\s*auto;/,
    );
  });
});
