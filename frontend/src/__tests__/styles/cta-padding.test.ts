import fs from 'node:fs';
import path from 'node:path';

describe('CTA padding token', () => {
  it('keeps mobile CTA compact', () => {
    const scssPath = path.resolve(__dirname, '../../../public/css/_hero.scss');
    const contents = fs.readFileSync(scssPath, 'utf8');

    expect(contents).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.HeroCTA[\s\S]*?@include\s+type-scale\(6px,\s*1vw,\s*6px\);/,
    );
    expect(contents).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.HeroCTA[\s\S]*?padding:\s*clamp\(6px,\s*1\.8vw,\s*10px\)\s*clamp\(10px,\s*3vw,\s*16px\);/,
    );
  });
});
