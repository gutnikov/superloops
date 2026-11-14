@docs/metamodel.md

# This repository

The catalog of sensors, tools and loops, the plugins built from it, and the site at sensorloop.dev.

- `catalog/`: the cards, the only home of their content. `sensors/<id>.md`, `tools/<id>.md`, `loops/<id>/card.md`
  (a loop's folder will also hold its scripts). Front matter is checked against `catalog/schema/`.
- Cards are written for any project, whatever its stack. A tool tied to a language is described as a role (the
  project's test command, found in the project). The products that can play the role, from several stacks, are its
  `vendors` in the front matter, each with a link and a short note; the site shows them as the card's last section.
  The text names a product only to show how the role is used.
- A relation is written once, on the more specific card: a tool lists the sensors it builds, a loop the sensors it
  reads. A sensor's tools and loops are computed, never written on its card.
- `packages/catalog`: the only code that parses cards. The site and the plugin builders import it.
- `docs/metamodel.md`: the metamodel, imported above and rendered on the home page. `docs/get-started.md`: how to
  install and use the plugin, rendered at /get-started/.
- A recorded terminal session in a doc is a line `<!-- cast: <name> | <caption> -->` and the file
  `docs/casts/<name>.cast`, recorded with asciinema (`asciinema rec docs/casts/<name>.cast`, about 90 columns wide);
  the site plays it in place. Until the file exists, the page shows where it goes.
- `site/`: renders `docs/` and the catalog. It holds no content of its own. Its look (the shell around every page,
  and the home page) is a folder in `site/src/looks/`: `tui-modern` is published, `report` is the one before it. Run
  another with `LOOK=report npm run dev -- --port 4401`; it builds into `site/dist-looks/<look>/`.
- `plugins/claude/`: the Claude Code plugin `sensorloop`, installed from the marketplace in `.claude-plugin/`. Its
  skill (`skills/sensorloop/`) keeps a project's loops; `procedures/` and `wiring/` are written by hand, `catalog/` is
  generated from `catalog/` by `npm run build:plugin` and committed (CI fails when it is out of date). The skill wires
  itself only the loops in `wiring/`; the rest it proposes. Its evals are in `plugins/claude/evals/`.
- This repository keeps its own loops with that skill: `.sensorloop/`, and the hooks and gates in
  `.claude/settings.json`. `.claude/skills/sensorloop` and `.claude/agents/flow-auditor.md` link to the plugin's, so a
  session here uses the skill as it stands in the working tree; a change to it takes effect in the next session.

```bash
npm ci
npm run check     # the catalog against its schemas and references, and the loader's tests
npm run dev       # the site at http://localhost:4321, reloading on changes to catalog/ and docs/
npm run build     # the site into site/dist
npm run build:plugin                       # the catalog into the plugin's skill; commit the result
npm run check:plugin                       # the plugin's catalog is current; the plugin and the marketplace are valid
claude plugin validate plugins/claude      # the plugin; `claude plugin validate .` for the marketplace
claude plugin eval plugins/claude --tag trigger --tag no-trigger   # whether the skill loads when it should
claude plugin eval plugins/claude --scaffold --allow-tools Bash Write Edit Agent   # every case, fixtures included
```

The plugin's evals call a model, so they do not run in CI: run them in the session that changes the plugin, and at
review. The trigger cases after any change to the skill's description; every case after a change to its procedures,
wiring or scripts. Add `--no-publish` to keep the report local.

Deploy (manual): `npm run build && cd site && npx wrangler@4 deploy`. The account is in `site/wrangler.jsonc`.

## Loops

@.sensorloop/LOOPS.md
