# Loops in this project

Kept by sensorloop from `.sensorloop/loops.yaml`; change the registry, not this file.

## Commands

| What | Command |
|---|---|
| The catalog and the loader's tests | `npm run check` |
| The plugin: its catalog current, it and the marketplace valid | `npm run check:plugin` |
| The site | `npm run build` |
| The page audit of the built site (Lighthouse) | `npm run lighthouse` |
| The same audit of the published site, sensorloop.dev | `npm run lighthouse:live` |
| Regenerate the plugin's catalog | `npm run build:plugin` |

## Before you change anything

Run `npm run check` before changing anything, and note what already fails. When you finish, run it again and compare:
a check that passed and now fails is yours to fix; one that already failed is not, so name it in your report and leave
it, unless the task is to fix it.

## Before you finish

`npm run check && npm run check:plugin` runs when you end the turn, and a failure keeps you working. When it says the
plugin's catalog is out of date, run `npm run build:plugin` and commit the result; never edit
`plugins/claude/skills/sensorloop/catalog/` by hand. The same failure three times hands it to the person.

Before each `git commit`, `npm run build` builds the site, and a failure refuses the commit: fix the page or the card
it names.

After a change to `site/`, to the shape of the cards or to `docs/`, run `npm run build && npm run lighthouse` (3 to 4
minutes). It scores five pages in Chrome against the minimums in `site/lighthouserc.yml`, and prints each failed
assertion with its expected and actual value. CI runs the same audit on every pull request (the `lighthouse` job), and
its failure is yours to fix. Open the representative run's report of the failing page (`site/.lighthouseci/`, in CI
the run's artifact `lighthouse`), fix the audits that cost the points, and run it again. After three rounds with the
same assertion failing, or when the cause is outside the site's code, stop and give the person the failing assertions
and the report.

## Ask a person first

`git push`, and the site's deploy (`npx wrangler@4 deploy`). A refused action is not tried another way (a rewritten
command, a script, `gh api`): say what you did not do and go on with the rest, or ask what to do instead.

Only a person changes the page audit's thresholds and pages: a hook refuses your edits to `site/lighthouserc.yml` and
`site/scripts/lighthouse-live.mjs`. Do not change them, or the scripts and CI job that run the audit, any other way.
When you think a threshold is wrong, tell the person what to change and why.

## After a deploy

When `wrangler deploy` succeeds, a hook runs `npm run lighthouse:live` (3 to 4 minutes): the page audit, with the same
pages and minimums, on sensorloop.dev. A failure there that the build passed comes from what only the published site
has, such as Cloudflare's headers, or from a deploy that did not publish the build. Tell the person the failing
assertions and the report (`site/.lighthouseci/live/`), and fix the cause in a new pull request.

## Never

- Weaken a check to make it pass: no raised limits, disabled rules, skipped or loosened tests.
- Edit `.sensorloop/`, `.claude/settings.json` or CI files to get past a loop.
