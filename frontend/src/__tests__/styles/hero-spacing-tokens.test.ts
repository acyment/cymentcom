import fs from 'node:fs';
import path from 'node:path';

describe('Hero spacing variables', () => {
  it('exposes hero padding tokens from variables file', () => {
    const variablesPath = path.resolve(
      __dirname,
      '../../../public/css/_variables.scss',
    );
    const contents = fs.readFileSync(variablesPath, 'utf8');

    expect(contents).toMatch(/\$main-padding-left:\s*.+/);
    expect(contents).toMatch(
      /\$negative-main-padding-left:\s*-.+\$main-padding-left/,
    );
  });
});
