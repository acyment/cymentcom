import fs from 'node:fs';
import path from 'node:path';

describe('Video migration guardrails: banned legacy dependencies', () => {
  it('package.json must not include hls.js or @mux player packages', () => {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    const deps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    } as Record<string, string>;

    const banned = [
      'hls.js',
      '@mux/mux-player',
      '@mux/mux-player-react',
      '@mux/mux-video',
      '@mux/playback-core',
    ];

    const present = banned.filter((name) => deps[name]);
    expect(present).toEqual([]);
  });
});
