---
title: Dependency graph analyser
summary: Builds the graph of imports between modules, checks it against the allowed directions, and measures its coupling.
sensors: [linter, dependency-graph]
layer: project
vendors:
  - name: dependency-cruiser
    url: https://github.com/sverweij/dependency-cruiser
    note: JavaScript, TypeScript
  - name: madge
    url: https://github.com/pahen/madge
    note: JavaScript, TypeScript; cycles, and the graph as an image
  - name: ArchUnit
    url: https://www.archunit.org/
    note: Java
  - name: import-linter
    url: https://github.com/import-linter/import-linter
    note: Python
  - name: Deptrac
    url: https://github.com/deptrac/deptrac
    note: PHP
  - name: NetArchTest
    url: https://github.com/BenMorris/NetArchTest
    note: .NET
  - name: go-arch-lint
    url: https://github.com/fe3dback/go-arch-lint
    note: Go
---

The project's rules name its layers and the directions in which one may import another: the UI may import the
domain, say, but the domain never imports the UI. The tool checks every import against those rules and reports a
wrong one as a lint violation. It also measures how coupled each module is: the cycles it is part of, its fan-in (how
many modules import it) and its fan-out (how many modules it imports). Each language has its own program, so look in
the project for the one it uses.

## Finding it

Look for the rules in the repository: `.dependency-cruiser.js`, an import-linter section in `pyproject.toml` or
`setup.cfg`, ArchUnit tests among the Java tests. Then look in CI for the step that runs them. When the project has
no rules, adding the tool and naming its layers is a decision for a person.

## Using it

- **Run it**: `depcruise src` for dependency-cruiser, `lint-imports` for import-linter; ArchUnit's rules run with the
  test command.
- **Keep a baseline that only shrinks**: record the known violations in the repository (`--output-type baseline` and
  `--ignore-known` in dependency-cruiser, `FreezingArchRule` in ArchUnit), so a new one fails, and remove old ones
  over time.
- **Save the coupling from each run**: cycles, fan-in and fan-out per module, on each pull request and on a schedule,
  so a new cycle, or a module whose coupling grew, shows against the values approved before.
