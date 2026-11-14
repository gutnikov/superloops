// The page audit of the published site: the same pages and minimums as site/lighthouserc.yml, which audits the build
// in dist/, loaded from https://sensorloop.dev instead. Run after each deploy: `npm run lighthouse:live`. It catches
// what the build cannot show: Cloudflare's headers and compression, and a deploy that did not publish the build.
// The reports go to .lighthouseci/live/. The minimums stay in the config, which only a person changes.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const SITE = 'https://sensorloop.dev';

// The config's pages are listed as http://localhost/<path>, one a line; the same paths on the published site.
const rc = fs.readFileSync(new URL('../lighthouserc.yml', import.meta.url), 'utf8');
const pages = [...rc.matchAll(/^\s*-\s*http:\/\/localhost(\/\S*)\s*$/gm)].map((m) => SITE + m[1]);
if (pages.length === 0) {
  throw new Error('LighthousePagesMissing: site/lighthouserc.yml lists no pages as http://localhost/<path>');
}

// No folder to serve (Lighthouse CI would point every page at it), and the reports beside the build's, not over them.
const args = [
  'autorun',
  '--collect.staticDistDir=',
  ...pages.map((url) => `--collect.url=${url}`),
  '--upload.outputDir=./.lighthouseci/live',
];
const run = spawnSync('lhci', args, { stdio: 'inherit' });
process.exit(run.status ?? 1);
