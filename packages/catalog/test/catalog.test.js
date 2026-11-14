// The loader against small catalogs written to a temporary folder: one that is valid, and one broken in each way
// the loader must catch.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { CatalogError, loadCatalog } from '../src/index.js';

const SCHEMAS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'catalog', 'schema');

const SENSOR = '---\ntitle: Test runner\ntype: computational\nsummary: Runs tests.\nsignal: Exit code.\n---\nBody.\n';
const TOOL =
  "---\ntitle: The project's test command\nsummary: Runs the tests.\nsensors: [test-runner]\nlayer: project\n" +
  'vendors:\n  - name: pytest\n    url: https://docs.pytest.org/\n    note: Python\n---\n';
const LOOP =
  '---\ntitle: Red, then green\nsummary: Test first.\nsensors: [test-runner]\n' +
  'when: Before and after.\nfailure: A test fails.\nnext: Fix the code.\n---\n';

/** Writes a catalog with the real schemas and the given cards ({ 'sensors/x.md': text }), and returns its folder. */
function catalog(cards) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sensorloop-catalog-'));
  fs.cpSync(SCHEMAS, path.join(root, 'schema'), { recursive: true });
  for (const [file, text] of Object.entries(cards)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  }
  return root;
}

/** The problems loadCatalog throws for these cards. */
function problems(cards) {
  try {
    loadCatalog(catalog(cards));
  } catch (error) {
    if (error instanceof CatalogError) return error.problems;
    throw error;
  }
  assert.fail('the catalog loaded, but it should not have');
}

test('a valid catalog loads, and a sensor knows its tools and loops without listing them', () => {
  const c = loadCatalog(
    catalog({ 'sensors/test-runner.md': SENSOR, 'tools/project-test-command.md': TOOL, 'loops/red-green-tdd/card.md': LOOP }),
  );
  assert.deepEqual(
    [c.sensors.length, c.tools.length, c.loops.length],
    [1, 1, 1],
  );
  assert.equal(c.get('sensors', 'test-runner').body, 'Body.');
  assert.deepEqual(c.toolsOf('test-runner').map((t) => t.id), ['project-test-command']);
  assert.deepEqual(c.loopsOf('test-runner').map((l) => l.id), ['red-green-tdd']);
  assert.deepEqual(c.toolsFor(c.get('loops', 'red-green-tdd')).map((t) => t.id), ['project-test-command']);
});

test('a card naming a sensor with no card', () => {
  assert.deepEqual(problems({ 'tools/project-test-command.md': TOOL }), [
    'tools/project-test-command.md: sensors names "test-runner", which has no card (sensors/test-runner.md)',
  ]);
});

test('front matter that breaks the schema', () => {
  const [problem] = problems({ 'sensors/test-runner.md': SENSOR.replace('computational', 'magical') });
  assert.match(problem, /^sensors\/test-runner\.md: type must be equal to one of the allowed values/);
});

test('a field the schema does not know', () => {
  const [problem] = problems({ 'sensors/test-runner.md': SENSOR.replace('---\nBody', 'tools: [project-test-command]\n---\nBody') });
  assert.match(problem, /^sensors\/test-runner\.md: front matter must NOT have additional properties/);
});

test('a tool with no vendors, and a vendor with no link', () => {
  const noVendors = TOOL.replace(/vendors:[\s\S]*?(?=---)/, '');
  assert.deepEqual(problems({ 'sensors/test-runner.md': SENSOR, 'tools/project-test-command.md': noVendors }), [
    "tools/project-test-command.md: front matter must have required property 'vendors'",
  ]);
  const noLink = TOOL.replace('    url: https://docs.pytest.org/\n', '');
  assert.deepEqual(problems({ 'sensors/test-runner.md': SENSOR, 'tools/project-test-command.md': noLink }), [
    "tools/project-test-command.md: vendors/0 must have required property 'url'",
  ]);
});

test('a loop that is a file instead of a folder', () => {
  assert.deepEqual(problems({ 'sensors/test-runner.md': SENSOR, 'loops/red-green-tdd.md': LOOP }), [
    'loops/red-green-tdd.md: not a card; a card here is a folder <id>/ with card.md in it',
  ]);
});

test('a card with no front matter, and an id that is not one', () => {
  assert.deepEqual(problems({ 'sensors/Test_Runner.md': SENSOR, 'sensors/linter.md': 'Just text.\n' }), [
    'sensors/Test_Runner.md: "Test_Runner" is not an id: lowercase letters and digits, words joined by hyphens',
    'sensors/linter.md: no front matter: a card starts with a --- line, its YAML, and another --- line',
  ]);
});

test('an illustration beside its card, with the card file name', () => {
  const c = loadCatalog(
    catalog({
      'sensors/test-runner.md': SENSOR,
      'sensors/test-runner.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
      'tools/project-test-command.md': TOOL,
      'loops/red-green-tdd/card.md': LOOP,
      'loops/red-green-tdd/card.png': 'png',
    }),
  );
  assert.equal(c.get('sensors', 'test-runner').illustration, 'sensors/test-runner.svg');
  assert.equal(c.get('loops', 'red-green-tdd').illustration, 'loops/red-green-tdd/card.png');
  assert.equal(c.get('tools', 'project-test-command').illustration, null);
});

test('an illustration with no card, and a card with two', () => {
  assert.deepEqual(
    problems({
      'sensors/test-runner.md': SENSOR,
      'sensors/test-runner.svg': '<svg/>',
      'sensors/test-runner.png': 'png',
      'sensors/linter.svg': '<svg/>',
    }),
    [
      'sensors/linter.svg: an illustration with no card (linter.md)',
      'sensors/test-runner.md: more than one illustration (test-runner.png, test-runner.svg); keep one',
    ],
  );
});

test('an SVG illustration that could run script on the site', () => {
  const svg = (inside) => `<svg xmlns="http://www.w3.org/2000/svg">${inside}</svg>`;
  const cases = {
    'a <script> element': '<script>alert(1)</script>',
    'a namespaced <script> element': '<svg:script>alert(1)</svg:script>',
    'an event handler': '<rect onload="alert(1)"/>',
    'a javascript: link': '<a href="javascript:alert(1)"><text>x</text></a>',
    'an entity-encoded link': '<a xlink:href="&#106;avascript:alert(1)"><text>x</text></a>',
    'embedded HTML': '<foreignObject><div>x</div></foreignObject>',
    'an animated link': '<a><set attributeName="href" to="javascript:alert(1)"/></a>',
  };
  for (const [name, inside] of Object.entries(cases)) {
    const found = problems({ 'sensors/test-runner.md': SENSOR, 'sensors/test-runner.svg': svg(inside) });
    assert.equal(found.length > 0, true, `${name} was let through`);
    assert.match(found[0], /^sensors\/test-runner\.svg: an SVG illustration may not carry /, name);
  }
  // A plain drawing, with a link to one of its own elements, is fine.
  const c = loadCatalog(
    catalog({
      'sensors/test-runner.md': SENSOR,
      'sensors/test-runner.svg': svg('<defs><path id="p" d="M0 0h1"/></defs><use href="#p"/><rect width="1" height="1"/>'),
    }),
  );
  assert.equal(c.get('sensors', 'test-runner').illustration, 'sensors/test-runner.svg');
});
