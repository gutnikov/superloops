---
title: The project's linter and formatter
summary: Whatever lints and formats this project's code, found in the project itself rather than assumed.
sensors: [linter]
layer: project
vendors:
  - name: ESLint
    url: https://eslint.org/
    note: JavaScript, TypeScript
  - name: Biome
    url: https://biomejs.dev/
    note: JavaScript, TypeScript; lints and formats
  - name: Ruff
    url: https://docs.astral.sh/ruff/
    note: Python; lints and formats
  - name: Clippy
    url: https://doc.rust-lang.org/clippy/
    note: Rust
  - name: golangci-lint
    url: https://golangci-lint.run/
    note: Go
  - name: RuboCop
    url: https://rubocop.org/
    note: Ruby
  - name: Prettier
    url: https://prettier.io/
    note: formats JavaScript and more
  - name: Black
    url: https://black.readthedocs.io/
    note: formats Python
  - name: gofmt
    url: https://pkg.go.dev/cmd/gofmt
    note: formats Go
---

The project chooses its own lint rules and its own format. This tool is whatever already lints and formats its code,
found in the project before anything is run.

## Finding it

Look where the project itself checks its code, in this order:

1. **CI**: the lint and format-check jobs. They are the commands the project trusts.
2. **The project's task file**: a `lint` or `format` script, target or task.
3. **The config files**: `eslint.config.js`, `ruff.toml`, `.golangci.yml`, `.prettierrc` and the like.
4. **The dependencies**: the linter and formatter the project installs, with their versions.

When these disagree, CI wins: it decides whether a change is merged. When the project has no linter or no formatter,
adding one is a decision for a person.

## Using it

- **On changed files while working**, where it is fast enough to run after every edit; on everything in CI.
- **The formatter writes locally and only checks in CI**: `prettier --write` against `prettier --check`, `ruff format`
  against `ruff format --check`, `gofmt -w` against `gofmt -l`. `gofmt -l` lists the files it would change but exits
  with zero, so the CI step fails when that list is not empty.
- **The pinned version**: run the same version locally and in CI, or the two disagree about the same code.
- **A custom rule says how to fix**: whoever writes one puts the fix in its message, so whoever reads the finding
  knows what to change.
