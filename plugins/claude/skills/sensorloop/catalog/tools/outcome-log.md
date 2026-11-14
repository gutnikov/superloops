---
title: Outcome log
summary: "A file in the repository that loops append to: each catch, escape, correction and unconfirmed release, with when and where it happened."
sensors: [loop-outcomes]
layer: project
vendors:
  - name: JSON Lines
    url: https://jsonlines.org/
    note: the file's format, one JSON object per line
  - name: jq
    url: https://jqlang.org/
    note: reads and filters it
---

The outcome log is a file in the repository that each loop appends to as it runs. It is the project's own file, so
look for its path in the project; never assume one.

## Finding it

The loops' configuration, or the project's instructions for agents, names the path the loops write to. Once it is
found, `git log --follow <path>` shows which changes wrote to it and when the last one did: a log the loops stopped
writing to looks clean when it is not.

When there is none, a person decides where it lives before any loop writes to it.

## Using it

- **One JSON object per line**, appended, never edited or reordered.
- **Each line names** the time, the phase (where in the change path it happened: local work, CI, staging,
  production), the kind and the place (a file, a commit, a pull request). An escape also names the earliest phase
  that could have caught it.
- **One name per kind**: `caught` (the loop meant to catch the problem caught it), `escape` (the problem got past
  that phase), `correction` (a person or a later sensor changed work a loop had passed), `unconfirmed-release` (real
  traffic did not confirm a release).
- **Committed with the work**, so the record travels with the change it describes.
- **No secrets and no user data**: the log is committed, so whatever goes in stays in the history.
- **Read with line tools**: `jq -c 'select(.kind == "escape")' <file>`.

A line reads, for example:

```json
{"time":"2026-11-14T09:12:00Z","phase":"production","kind":"escape","place":"src/parse.ts","earliest":"unit tests"}
```
