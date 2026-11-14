---
title: The project's type checker
summary: Checks the types of the code without running it, where the language has a checker separate from its build.
sensors: [build-and-types]
layer: project
vendors:
  - name: TypeScript
    url: https://www.typescriptlang.org/
    note: "`tsc --noEmit`"
  - name: mypy
    url: https://mypy-lang.org/
    note: Python
  - name: Pyright
    url: https://github.com/microsoft/pyright
    note: Python
  - name: Sorbet
    url: https://sorbet.org/
    note: Ruby
  - name: PHPStan
    url: https://phpstan.org/
    note: PHP
---

Where a language checks its types with a program separate from its build, this tool is that checker, with the settings
the project gives it. Look up which checker the project uses, and how strict it is, rather than pick one.

## Finding it

1. **CI and the task file**: a type-check step and the command it runs.
2. **The checker's config**, for example `tsconfig.json`, `mypy.ini`, `pyrightconfig.json`, a `[tool.mypy]` or
   `[tool.pyright]` section in `pyproject.toml`, or `sorbet/config`.
3. **The dev dependencies**: the checker and its pinned version.

Where the compiler checks types as part of the build (Go, Rust, Java), the build is the type check. When the project
has no checker, adding one, and choosing how strict it is, is a decision for a person.

## Using it

- **Run it as CI does**: `tsc --noEmit`, `mypy`, `pyright`, with the project's config and strictness, not the
  checker's defaults.
- **Run the pinned version**: a new release of the checker can find new errors in code that did not change.
- **Look for new suppressions in the diff**: the checker does not report a new `# type: ignore`, `@ts-ignore` or
  `@ts-expect-error`, so a search over the diff finds them; `mypy --warn-unused-ignores` reports the ones no longer
  needed.
