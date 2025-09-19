import fs from 'node:fs';
import path from 'node:path';

describe('Contacto links on mobile', () => {
  it('applies RoughNotation consistently with mobile padding', () => {
    const componentPath = path.resolve(
      __dirname,
      '../../components/Contacto.jsx',
    );
    const contents = fs.readFileSync(componentPath, 'utf8');

    // We now render RoughNotation in both desktop and mobile,
    // using a conditional padding to keep annotation subtle on mobile.
    expect(contents).toMatch(
      /<RoughNotation[\s\S]*padding=\{isMobile \? 2 : 8\}/,
    );
  });

  it('style looks clickable', () => {
    const scssPath = path.resolve(__dirname, '../../../public/css/styles.scss');
    const contents = fs.readFileSync(scssPath, 'utf8');

    // Mobile contact links use a mobile-friendly type scale and left alignment
    expect(contents).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.AreaContacto\s+\.NavigationMenuLink\s*\{[\s\S]*?@include\s+type-scale\(16px,\s*4vw,\s*20px\);/,
    );
  });
});
