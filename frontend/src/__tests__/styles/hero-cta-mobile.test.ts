import fs from 'node:fs';
import path from 'node:path';

describe('Hero CTA styles live in _hero.scss', () => {
  it('captures base, mobile, and desktop rules', () => {
    const scssPath = path.resolve(__dirname, '../../../public/css/_hero.scss');
    const contents = fs.readFileSync(scssPath, 'utf8');

    // Base row spacing and alignment
    expect(contents).toMatch(
      /\.HeroCTARow\s*\{[\s\S]*?margin-top:\s*clamp\(26px,\s*4\.5vw,\s*48px\);[\s\S]*?justify-content:\s*space-between;/,
    );
    expect(contents).toMatch(
      /\.HeroCTA\s*\{[\s\S]*?@include\s+type-scale\(23px,\s*7\.6vw,\s*38px\);[\s\S]*?padding:\s*clamp\(15px,\s*2\.9vw,\s*24px\)\s*clamp\(24px,\s*4\.6vw,\s*34px\);/,
    );
    // Mobile adjustments
    expect(contents).toMatch(
      /@include\s+down\(\$bp-md\)[\s\S]*?\.HeroCTARow[\s\S]*?margin-top:\s*clamp\(10px,\s*2\.6vw,\s*18px\);/,
    );
    expect(contents).toMatch(
      /@include\s+down\(\$bp-md\)[\s\S]*?\.HeroCTA[\s\S]*?@include\s+type-scale\(6px,\s*1vw,\s*6px\);/,
    );
    expect(contents).toMatch(
      /@media\s*\(min-width:\s*769px\)\s*\{[\s\S]*?\.HeroCTA[\s\S]*?@include\s+type-scale\(20px,\s*6\.2vw,\s*32px\);/,
    );
  });
});
