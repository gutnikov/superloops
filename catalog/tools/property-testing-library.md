---
title: Property-based testing library
summary: Generates inputs for a test from a description of them, and shrinks a failing input to the smallest one that still fails.
sensors: [input-fault-injection]
layer: project
vendors:
  - name: Hypothesis
    url: https://hypothesis.readthedocs.io/
    note: Python
  - name: fast-check
    url: https://fast-check.dev/
    note: JavaScript, TypeScript
  - name: jqwik
    url: https://jqwik.net/
    note: Java
  - name: proptest
    url: https://github.com/proptest-rs/proptest
    note: Rust
  - name: rapid
    url: https://github.com/flyingmutant/rapid
    note: Go
  - name: FsCheck
    url: https://fscheck.github.io/FsCheck/
    note: .NET
  - name: QuickCheck
    url: https://hackage.haskell.org/package/QuickCheck
    note: Haskell
---

A property-based testing library lets a test describe its inputs instead of listing them, and state a property: what
must hold for all of them. For example, decoding an encoded value gives back the same value, whatever the value. The
library generates many inputs; when one breaks the property, it shrinks it to the smallest input that still fails,
called a counterexample. So it builds the input side of the input and fault injection sensor; faults come from other
tools.

Each language has its own library, so look in the project for the one it uses rather than assume one.

## Finding it

- **The dependency manifest**: the library among the test dependencies.
- **Existing tests** that use it: `@given` in Python, `fc.assert` in JavaScript, `@Property` in Java, `proptest!`
  in Rust.
- **Its settings**: the number of cases per property, and profiles for local runs and CI (the `settings` profiles of
  Hypothesis, in Python, often in `conftest.py`).

It has no command of its own: property tests run with the project's test command. When the project has no such
library, adding one is a decision for a person.

## Using it

- **Reproduce a failure from its seed**: each library prints the seed or the failing case, and Hypothesis also keeps
  failing examples in its `.hypothesis` folder.
- **Keep the shrunk input as a fixed case** (`@example` in Hypothesis, or a plain unit test), so it is checked on
  every run.
- **Run more cases on a schedule** than on every change (`max_examples` in Hypothesis, `numRuns` in fast-check for
  JavaScript).
