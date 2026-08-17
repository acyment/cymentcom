import fs from 'node:fs';
import path from 'node:path';

describe('Hero heading type scale', () => {
  it('scales down on desktop and up on mobile for readability', () => {
    const scssPath = path.resolve(__dirname, '../../../public/css/_hero.scss');
    const contents = fs.readFileSync(scssPath, 'utf8');

    expect(contents).toMatch(/\.HeroText\s*\{[\s\S]*?font-size:\s*2\.6vw;/);

    // 2.6vw is unreadably small on a phone, so the mobile block bumps it
    // (2b9ed0d "set mobile .HeroText to 4.3vw for better readability"). This
    // override is deliberate; the test used to assert it must not exist.
    expect(contents).toMatch(
      /@include down\(\$bp-md\)[\s\S]*?\.HeroText\s*\{[\s\S]*?font-size:\s*4\.3vw;/,
    );
  });
});
