---
title: The project's snapshot library
summary: Compares output with an approved reference stored in the repository, and shows the difference when they part.
sensors: [test-runner]
layer: project
vendors:
  - name: Jest
    url: https://jestjs.io/docs/snapshot-testing
    note: JavaScript; Vitest has the same
  - name: insta
    url: https://insta.rs/
    note: Rust
  - name: syrupy
    url: https://github.com/syrupy-project/syrupy
    note: Python, with pytest
  - name: Verify
    url: https://github.com/VerifyTests/Verify
    note: .NET
  - name: ApprovalTests
    url: https://approvaltests.com/
    note: several languages
  - name: goldie
    url: https://github.com/sebdah/goldie
    note: Go; golden files
---

The approved output that a snapshot library keeps in the repository is called a reference: a snapshot, an approved
file or a golden file, depending on the library. The project's test command runs the comparisons.

## Finding it

Look in the test dependencies, then for the references themselves: a `__snapshots__` directory beside the tests,
`.snap` or `.approved.` files, or a `testdata` directory of golden files. When the project has no snapshot library,
adding one is a decision for a person.

## Using it

- **Compare**: the comparisons run with the tests, and a mismatch fails its test with a diff of the two outputs.
- **Update only on purpose**: updating a reference (`jest -u`, `cargo insta review`) approves the new output. It is
  never a way to make a failing test pass.
- **No new references in CI**: there, a missing reference fails instead of being written (`jest --ci`), so nothing is
  approved unseen.
- **Review the diff**: a changed reference is part of the change and is read in review like the code.
- **Stable output**: the test replaces values that change from run to run (times, random ids, absolute paths) with
  fixed ones before it compares, for example with property matchers in Jest, redactions in insta or scrubbers in
  ApprovalTests. A reference then changes only when the output does.
