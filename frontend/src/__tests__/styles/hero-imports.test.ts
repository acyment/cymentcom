import fs from 'node:fs';
import path from 'node:path';

describe('Hero partial dependencies', () => {
  it('imports shared variables and mixins directly', () => {
    const scssPath = path.resolve(__dirname, '../../../public/css/_hero.scss');
    const contents = fs.readFileSync(scssPath, 'utf8');

    expect(contents).toMatch(/@import '\.\/variables';/);
    expect(contents).toMatch(/@import '\.\/mixins';/);
  });
});
