import fs from 'node:fs';
import path from 'node:path';

describe('CTA padding token', () => {
  it('gives the mobile CTA a readable size and a 44px tap target', () => {
    const scssPath = path.resolve(__dirname, '../../../public/css/_hero.scss');
    const contents = fs.readFileSync(scssPath, 'utf8');

    // This used to pin type-scale(6px, 1vw, 6px) — a 6px CTA label, far below
    // a usable size. The mobile pass replaced it with a legible scale and an
    // explicit minimum tap target.
    expect(contents).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.HeroCTA[\s\S]*?@include\s+type-scale\(14px,\s*4vw,\s*18px\);/,
    );
    expect(contents).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.HeroCTA[\s\S]*?padding:\s*clamp\(10px,\s*3vw,\s*16px\)\s*clamp\(16px,\s*5vw,\s*22px\);/,
    );
    expect(contents).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.HeroCTA[\s\S]*?min-height:\s*44px;/,
    );
  });
});
