// Iosevka cut down to what the site shows: `npm run fonts -w site`, then commit the two files it writes.
//
// @fontsource/iosevka ships the whole font, about 1 MB a weight: every script Iosevka covers. The tui-modern look needs
// Latin, punctuation, arrows and the like, and the characters a terminal draws with: box drawing, blocks, shapes and
// braille (the torus on the home page is braille). This keeps those ranges, with room for text the catalog may gain,
// and writes woff2 files beside the look's stylesheet, which declares them with the same ranges (RANGES below).
// Run it again after upgrading @fontsource/iosevka or changing the ranges.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const require = createRequire(import.meta.url);
const SOURCE = path.join(path.dirname(require.resolve('@fontsource/iosevka/package.json')), 'files');
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'looks', 'tui-modern', 'fonts');

/** The characters kept, as code point ranges; look.css repeats them as the faces' unicode-range. */
export const RANGES = [
  [0x0020, 0x007e], // Basic Latin
  [0x00a0, 0x00ff], // Latin-1: accented letters, ·, ×, «», non-breaking space
  [0x0100, 0x017f], // Latin Extended-A, for names
  [0x2000, 0x206f], // General Punctuation: dashes, quotes, bullet, ellipsis, thin spaces
  [0x20ac, 0x20ac], // €
  [0x2122, 0x2122], // ™
  [0x2190, 0x21ff], // Arrows
  [0x2200, 0x22ff], // Mathematical Operators: ≤ ≥ ≠ ≈ ∞
  [0x2300, 0x23ff], // Miscellaneous Technical: ⌘ ⏎ ⌫
  [0x2500, 0x257f], // Box Drawing
  [0x2580, 0x259f], // Block Elements: the meters' bars
  [0x25a0, 0x25ff], // Geometric Shapes: ■ ▸ ▾
  [0x2700, 0x27bf], // Dingbats: ❯ ✓ ✗
  [0x2800, 0x28ff], // Braille: the torus
  [0xfffd, 0xfffd], // the replacement character
];

// The OpenType features kept: the ones browsers apply to Latin text by themselves, and tabular figures, which the
// look asks for. Ligatures are off in the look (font-variant-ligatures: none), and Iosevka's hundreds of character
// variants (cv01…, ss01…) are never switched on, so their glyphs are left out.
const FEATURES = ['ccmp', 'locl', 'mark', 'mkmk', 'kern', 'tnum'];

const text = RANGES.flatMap(([from, to]) =>
  Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)),
).join('');

fs.mkdirSync(OUT, { recursive: true });
for (const weight of [400, 700]) {
  const from = path.join(SOURCE, `iosevka-latin-${weight}-normal.woff2`);
  const to = path.join(OUT, `iosevka-${weight}.woff2`);
  const input = fs.readFileSync(from);
  const output = await subsetFont(input, text, { targetFormat: 'woff2', keepFeatures: FEATURES });
  fs.writeFileSync(to, output);
  const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
  console.log(`${path.relative(process.cwd(), to)}: ${kb(output.length)} (from ${kb(input.length)})`);
}
