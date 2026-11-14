---
title: Mutation tester
summary: Makes small changes to the code, runs the tests against each, and reports the changes no test noticed.
sensors: [coverage-mutants]
layer: project
vendors:
  - name: Stryker
    url: https://stryker-mutator.io/
    note: JavaScript, TypeScript, C#, Scala
  - name: PIT
    url: https://pitest.org/
    note: Java
  - name: mutmut
    url: https://github.com/boxed/mutmut
    note: Python
  - name: cargo-mutants
    url: https://mutants.rs/
    note: Rust
  - name: Infection
    url: https://infection.github.io/
    note: PHP
  - name: Gremlins
    url: https://github.com/go-gremlins/gremlins
    note: Go
---

A mutation tester changes the code in small ways (a `<` for a `<=`, a call removed) and runs the project's tests
against each changed version, called a mutant. A mutant is killed when a test fails on it, and survives when none
does; the score is the share of mutants killed. Each language has its own tool, so look in the project for the one it
uses rather than assume one.

## Finding it

1. **CI**: a mutation job, usually a scheduled one, and the command it runs.
2. **The tool's config**: a file of its own (`stryker.config.json`), a plugin in the build file (`pom.xml`,
   `build.gradle`), or a section in `pyproject.toml` or `setup.cfg`.
3. **The dependency manifest**: the tool among the development dependencies.

When the project has none, choosing one for its language and test framework is a decision for a person.

## Using it

- **Start from a green suite**: the tests must pass on the unchanged code first, or the score means nothing.
- **Limit it while working** to the changed files or the diff (`--mutate` in Stryker, `--in-diff` in cargo-mutants).
- **Run the whole codebase on a schedule**: one test run per mutant makes it the slowest check the project has.
- **Keep a timeout per mutant**, since a mutant can loop forever.
- **Keep the report**, as JSON for other tools or HTML for people: it lists each surviving mutant with its change.
