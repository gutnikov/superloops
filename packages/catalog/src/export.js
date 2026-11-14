#!/usr/bin/env node
// Writes the catalog for an agent to read: index.md, one line per card with the relations the loader computes (and a
// tool's vendors, by name), and every card as it is, under sensors/, tools/ and loops/. The plugin's skill carries
// this folder; it is generated, so it is rewritten whole and never edited by hand. With --check it writes nothing: it exports to a temporary folder,
// lists each file that differs from <out dir>, and exits 1 when any does.
// Usage: node src/export.js [--check] <out dir> [catalog folder]   (default catalog: the repository's catalog/)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CatalogError, kinds, loadCatalog } from './index.js';

const args = process.argv.slice(2);
const check = args[0] === '--check';
const [outArg, rootArg] = check ? args.slice(1) : args;
if (!outArg) {
  console.error('usage: node src/export.js [--check] <out dir> [catalog folder]');
  process.exit(2);
}
const root = path.resolve(rootArg ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'catalog'));
const target = path.resolve(outArg);
const out = check ? fs.mkdtempSync(path.join(os.tmpdir(), 'sensorloop-export-')) : target;

let catalog;
try {
  catalog = loadCatalog(root);
} catch (error) {
  if (!(error instanceof CatalogError)) throw error;
  console.error(error.message);
  process.exit(1);
}

const ids = (/** @type {{ id: string }[]} */ cards) => cards.map((card) => `\`${card.id}\``).join(', ') || 'none yet';

/** One line per card: its id, title and summary, and what it is linked to. */
const line = {
  sensors: (card) =>
    `- \`${card.id}\`: **${card.data.title}** (${card.data.type}). ${card.data.summary} ` +
    `Tools: ${ids(catalog.toolsOf(card.id))}. Loops: ${ids(catalog.loopsOf(card.id))}.`,
  tools: (card) =>
    `- \`${card.id}\`: **${card.data.title}** (${card.data.layer}). ${card.data.summary} ` +
    `Builds: ${card.data.sensors.map((s) => `\`${s}\``).join(', ')}. ` +
    `Vendors: ${card.data.vendors.map((v) => v.name).join(', ')}.`,
  loops: (card) =>
    `- \`${card.id}\`: **${card.data.title}**. ${card.data.summary} ` +
    `Reads: ${card.data.sensors.map((s) => `\`${s}\``).join(', ')}. When: ${card.data.when}`,
};

const heading = { sensors: 'Sensors', tools: 'Tools', loops: 'Loops' };

const index = [
  '# The catalog',
  '',
  'Every sensor, tool and loop, one line each, with what it is linked to. The card behind a line is',
  '`sensors/<id>.md`, `tools/<id>.md` or `loops/<id>.md` beside this file. Generated from the catalog; do not edit.',
  ...kinds.flatMap((kind) => ['', `## ${heading[kind]} (${catalog[kind].length})`, '', ...catalog[kind].map(line[kind])]),
  '',
].join('\n');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.md'), index);
for (const kind of kinds) {
  fs.mkdirSync(path.join(out, kind), { recursive: true });
  for (const card of catalog[kind]) {
    fs.copyFileSync(path.join(root, card.file), path.join(out, kind, `${card.id}.md`));
  }
}

if (check) {
  /** Every file under a folder, as paths relative to it; none when the folder does not exist. */
  const files = (dir) =>
    fs.existsSync(dir)
      ? fs.readdirSync(dir, { recursive: true }).filter((f) => fs.statSync(path.join(dir, f)).isFile())
      : [];
  const fresh = new Set(files(out));
  const kept = new Set(files(target));
  const differ = [
    ...[...fresh].filter((f) => !kept.has(f)).map((f) => `missing  ${f}`),
    ...[...kept].filter((f) => !fresh.has(f)).map((f) => `extra    ${f}`),
    ...[...fresh]
      .filter((f) => kept.has(f) && !fs.readFileSync(path.join(out, f)).equals(fs.readFileSync(path.join(target, f))))
      .map((f) => `changed  ${f}`),
  ].sort((a, b) => a.slice(9).localeCompare(b.slice(9)));
  fs.rmSync(out, { recursive: true, force: true });
  const shown = path.relative(process.cwd(), target) || '.';
  if (differ.length) {
    console.error(`${shown} is out of date with the catalog; run npm run build:plugin and commit it:`);
    for (const line of differ) console.error(`  ${line}`);
    process.exit(1);
  }
  console.log(`${shown} is current with the catalog`);
} else {
  console.log(
    `exported to ${path.relative(process.cwd(), out) || '.'}: ` +
      `${catalog.sensors.length} sensors, ${catalog.tools.length} tools, ${catalog.loops.length} loops`,
  );
}
