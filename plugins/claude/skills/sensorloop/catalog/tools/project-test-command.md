---
title: The project's test command
summary: Whatever runs this project's tests, found in the project itself rather than assumed.
sensors: [test-runner]
layer: project
vendors:
  - name: pytest
    url: https://docs.pytest.org/
    note: Python
  - name: Jest
    url: https://jestjs.io/
    note: JavaScript
  - name: Vitest
    url: https://vitest.dev/
    note: JavaScript, TypeScript
  - name: go test
    url: https://pkg.go.dev/cmd/go#hdr-Test_packages
    note: Go
  - name: cargo test
    url: https://doc.rust-lang.org/cargo/commands/cargo-test.html
    note: Rust
  - name: JUnit
    url: https://junit.org/
    note: Java, run by Gradle or Maven
  - name: RSpec
    url: https://rspec.info/
    note: Ruby
  - name: dotnet test
    url: https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-test
    note: .NET
  - name: PHPUnit
    url: https://phpunit.de/
    note: PHP
---

The project, not the loop, chooses how its tests run. This tool is the command the project already uses, found in
the project before anything is run.

## Finding it

Look where the project itself runs its tests, in this order:

1. **CI**: the job that runs the tests on every pull request. It is the command the project trusts.
2. **The project's task file**: a `test` script, target or task in the file the project runs its tasks from.
3. **The README or the contributing guide**: the command it tells contributors to run.
4. **The test framework's default**, read off the framework the project depends on. It is the weakest of the four:
   the project may run its tests another way.

When these disagree, CI wins: it decides whether a change is merged. When none of them names a command, ask a person
rather than guess. When CI runs the tests in several jobs, or starts services and sets variables for them, a local
run needs the same, or its results differ from CI's.

## Running all of it, or one test

- **The whole suite**: the command as found. The work counts as done only when this passes; a test that already
  failed before the change is reported, and not counted against it.
- **One test**, to see a single failure quickly: pass the framework's filter through the project's command where it
  accepts one, so the project's setup still runs. Every framework has its own filter, for example `pytest path::name`,
  `npx jest -t name` or `go test -run Name ./pkg`. Read the framework's help rather than guess the flag.
