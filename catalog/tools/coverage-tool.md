---
title: The project's coverage tool
summary: Whatever measures which lines and branches this project's tests run, with a report other tools can read.
sensors: [coverage-mutants]
layer: project
vendors:
  - name: coverage.py
    url: https://coverage.readthedocs.io/
    note: Python
  - name: c8
    url: https://github.com/bcoe/c8
    note: JavaScript, from V8's own coverage
  - name: Istanbul
    url: https://istanbul.js.org/
    note: JavaScript; `nyc` is its command line
  - name: JaCoCo
    url: https://www.jacoco.org/jacoco/
    note: Java
  - name: Go's coverage
    url: https://go.dev/doc/build-cover
    note: "`go test -cover` and `go tool cover`"
  - name: cargo-llvm-cov
    url: https://github.com/taiki-e/cargo-llvm-cov
    note: Rust
  - name: Coverlet
    url: https://github.com/coverlet-coverage/coverlet
    note: .NET
  - name: diff-cover
    url: https://github.com/Bachmann1234/diff_cover
    note: the coverage of the changed lines alone, from any of these reports
---

Coverage is measured by a tool tied to the project's language and test framework. This tool is the one the project
already uses, found in the project rather than assumed.

## Finding it

1. **CI**: the job that runs the tests with coverage on, and the report it keeps or uploads.
2. **The task file and the config**: a `coverage` script or target, a coverage section in the test framework's
   config, or the tool's own file (`.coveragerc`, `.nycrc`).
3. **The dependency manifest**: the coverage package among the test dependencies.

When these disagree, CI wins. When none of them names a tool, ask a person before adding one.

## Using it

- **Run the tests with coverage on** through the project's own test command where that command accepts the option,
  for example `npm test -- --coverage` where the test script runs Jest. Otherwise use the tool's own command, such as
  `coverage run -m pytest` or `go test -coverprofile=cover.out ./...`.
- **Write a common report format** (LCOV, Cobertura XML), or convert to one, so other tools can read it.
- **Measure the changed lines**, not only the total: a diff-coverage tool reads the report with the diff from the
  main branch.
- **Keep a floor that only rises**: the minimum coverage, set in the config (`fail_under` in coverage.py,
  `coverageThreshold` in Jest). Raise it as coverage grows, and never lower it to make a run pass.
