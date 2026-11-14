// How a card is shown: the names of the kinds, a card's address, and the facts listed under its title (with the
// relations the catalog computes, such as a sensor's tools and loops).
import { config } from '../config.mjs';
import { inline } from './content.js';

/** Each kind has its own page, /sensors/, /tools/ and /loops/, with the lede below its title. */
export const KIND = {
  sensors: {
    one: 'Sensor',
    many: 'Sensors',
    lede:
      'A sensor observes a change, or the system the change lives in, and reports a signal about its quality: ' +
      'pass or fail, a score, or a list of findings. It never changes the work.',
  },
  tools: {
    one: 'Tool',
    many: 'Tools',
    lede:
      'What the sensors are built with. Each tool is described for any project: one tied to a language is the ' +
      'role it plays, found in the project, and its vendors are the products that can play it.',
  },
  loops: {
    one: 'Loop',
    many: 'Loops',
    lede:
      'A loop connects a sensor to the work: when the sensor is read, what counts as a failure, and what happens ' +
      'next.',
  },
};

/** A kind's page. */
export const kindHref = (/** @type {string} */ kind) => `/${kind}/`;

/**
 * How a kind's cards are grouped, in its side navigation and on its page: sensors by type, tools by where they are;
 * loops in one list.
 */
const GROUPING = {
  sensors: {
    field: 'type',
    labels: { computational: 'Computational', inferential: 'Inferential', human: 'Human' },
  },
  tools: {
    field: 'layer',
    labels: { project: 'In the project', system: 'Outside the project', agent: 'In the coding agent' },
  },
};

/**
 * A kind's cards in groups, in the order of the labels above; a value with no label yet gets a group of its own
 * at the end, so a card is never left out.
 * @returns {{ label: string | null, cards: any[] }[]}
 */
export function groups(catalog, kind) {
  const cards = catalog[kind];
  const grouping = GROUPING[kind];
  if (!grouping) return [{ label: null, cards }];
  const values = [...new Set([...Object.keys(grouping.labels), ...cards.map((card) => card.data[grouping.field])])];
  return values
    .map((value) => ({
      label: grouping.labels[value] ?? value,
      cards: cards.filter((card) => card.data[grouping.field] === value),
    }))
    .filter((group) => group.cards.length > 0);
}

/** @param {{ kind: string, id: string }} card */
export const href = (card) => `/${card.kind}/${card.id}/`;

/** The name a card's illustration is served under, beside its page: illustration.svg, illustration.png. */
export const illustrationName = (/** @type {{ illustration: string }} */ card) =>
  `illustration${card.illustration.slice(card.illustration.lastIndexOf('.'))}`;

/** Where a card without an illustration would get one: its file, with .svg for .md. */
export const illustrationPlace = (/** @type {{ file: string }} */ card) =>
  `catalog/${card.file.replace(/\.md$/, '.svg')}`;

/** The card's file in the repository. */
export const source = (/** @type {{ file: string }} */ card) =>
  `${config.repository}/blob/${config.branch}/catalog/${card.file}`;

const escape = (/** @type {string} */ text) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Links to cards, or a muted "none yet". */
const links = (/** @type {any[]} */ cards) =>
  cards.length > 0
    ? cards.map((card) => `<a href="${href(card)}">${escape(card.data.title)}</a>`).join(', ')
    : '<span class="none">none yet</span>';

/** The line above a card's title. */
export function kicker(card) {
  const detail = {
    sensors: card.data.type,
    tools: GROUPING.tools.labels[card.data.layer]?.toLowerCase(),
  }[card.kind];
  return detail ? `${KIND[card.kind].one} · ${detail}` : KIND[card.kind].one;
}

/** The short facts of a card in the catalog's list. */
export function meta(catalog, card) {
  switch (card.kind) {
    case 'sensors':
      return [['type', card.data.type], ['tools', catalog.toolsOf(card.id).length], ['loops', catalog.loopsOf(card.id).length]];
    case 'tools':
      return [['builds', card.data.sensors.map((id) => catalog.get('sensors', id).data.title).join(', ')]];
    case 'loops':
      return [['reads', card.data.sensors.map((id) => catalog.get('sensors', id).data.title).join(', ')]];
  }
}

/** The facts under a card's title, as label and HTML. */
export function facts(catalog, card) {
  const sensors = () => links(card.data.sensors.map((id) => catalog.get('sensors', id)));
  switch (card.kind) {
    case 'sensors':
      return [
        ['Type', escape(card.data.type)],
        ['Signal', inline(card.data.signal)],
        ['Tools', links(catalog.toolsOf(card.id))],
        ['Loops', links(catalog.loopsOf(card.id))],
      ];
    case 'tools':
      return [['Builds', sensors()]];
    case 'loops':
      return [
        ['Reads', sensors()],
        ['When', inline(card.data.when)],
        ['Failure', inline(card.data.failure)],
        ['Next', inline(card.data.next)],
        ['Tools', links(catalog.toolsFor(card))],
      ];
  }
}

/**
 * A tool's vendors as the last section of its text, in Markdown: each product linked, with its note after it. Other
 * kinds have none.
 */
export function vendors(card) {
  if (card.kind !== 'tools') return '';
  const name = (/** @type {string} */ text) => text.replace(/[\\`*_[\]]/g, '\\$&');
  const items = card.data.vendors.map(
    (/** @type {{ name: string, url: string, note?: string }} */ v) =>
      `- **[${name(v.name)}](<${v.url}>)**${v.note ? `: ${v.note}` : ''}`,
  );
  return ['## Vendors', '', ...items].join('\n');
}
