import fs from 'node:fs';
import path from 'node:path';

const scss = fs.readFileSync(
  path.resolve(__dirname, '../../../public/css/styles.scss'),
  'utf8',
);

describe('Checkout fullscreen mobile styling', () => {
  it('hides the desktop close button in mobile header', () => {
    expect(scss).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.HeaderModal[\s\S]*?\.close-button\s*\{[\s\S]*?display:\s*none;/,
    );
  });

  it('allows the progress indicator to wrap or scroll on mobile', () => {
    expect(scss).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.progress-indicator[\s\S]*?(flex-wrap:\s*wrap|overflow-x:\s*auto)/,
    );
  });

  it('scales down the course info card on mobile', () => {
    expect(scss).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.CursoInfo[\s\S]*?flex-direction:\s*column;[\s\S]*?gap:\s*[^;]+;/,
    );
  });

  it('raises label legibility on mobile', () => {
    expect(scss).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.form-element\s+label[\s\S]*?font-size:\s*clamp\([^)]*\);/,
    );
  });
});
