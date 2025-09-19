import fs from 'node:fs';
import path from 'node:path';

const scss = fs.readFileSync(
  path.resolve(__dirname, '../../../public/css/styles.scss'),
  'utf8',
);

describe('Checkout fullscreen mobile styling', () => {
  // In the new fullscreen flow, the desktop header isn't reused on mobile,
  // so we no longer assert hiding the desktop close button.

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

  it('raises form control legibility on mobile', () => {
    // We now scale input font size directly for mobile
    expect(scss).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.form-control[\s\S]*?font-size:\s*4\.5vw;/,
    );
  });
});
