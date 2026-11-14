---
title: Compare with approved output
summary: A test compares the output with a reference stored in the repository. The agent fixes a difference the change does not explain, and proposes one it does explain to a person, who alone approves the new reference.
sensors: [test-runner, human-review]
when: On every run of the tests, locally and in CI on every pull request; and in CI on every pull request that changes a reference file.
failure: An output that differs from its reference, or a reference that is missing. In CI, also a reference changed on the branch that no person has approved.
next: The agent sorts each difference. One the change's requirement does not explain is a regression, and the agent fixes the code, never the reference, until the output matches. One the requirement explains goes to a person as a proposed reference, with the requirement behind each changed part; the person approves it or sends it back, and the merge waits for that answer. When a regression still shows after three rounds, or the agent cannot tell which kind a difference is, it stops and shows the person the diff and what it tried.
---

## The loop

1. A test produces an output (a response, a report, a generated file, a rendered component) and compares it with the
   reference stored beside the test: a snapshot, an approved file or a golden file. A difference fails the test and
   prints the diff.
2. The agent reads the diff against the requirement of its change:
   - **unexpected**: the requirement does not explain it. It is a regression, and the agent fixes the code until the
     output matches the reference again;
   - **expected**: the requirement explains it. The agent proposes the new output in the pull request (the test's
     diff, or the received file the library writes beside the approved one) and names the requirement behind each
     changed part.
3. A person reads the proposal with its diff and approves it or sends it back. Approving is the person's step: they
   run the update, or copy the received file over the approved one.
4. In CI, the tests run without the update flag, so a missing or changed output fails there. A reference changed on
   the branch with no approval from a person fails the job.

In a refactor, every difference is unexpected: the references hold the behaviour from before the work, which the
work must not change.

## Why

A comparison with the whole output catches changes no assertion was written for, but a diff does not say whether
the change was wanted. Snapshot libraries have a command that writes the current output as the new reference:
`jest -u`, `vitest -u`, `pytest --snapshot-update` with syrupy, `cargo insta accept`, the `-update` flag of many Go
golden-file tests. An agent that runs it on a failing test turns any regression into the expected output, and the
test passes. So the agent fixes differences and proposes references, and only a person approves them.

## Set up

- **References live in the repository**, beside their tests, and are read in review like the code.
- **CI never writes a reference.** Where a library writes a missing reference on its own, CI turns that off: with
  `jest --ci`, a new snapshot fails the test instead of being stored.
- **Out of the agent's reach.** A hook refuses the agent's writes to the reference files (`__snapshots__/`,
  `*.approved.*`, a `testdata` directory of golden files) and its runs of the update command. Code owners on those
  paths make a person's approving review required for any change to them, which the agent cannot give.
- **Scrub what changes on every run** (times, generated ids, absolute paths, the order of unordered collections)
  before the comparison: property matchers in Jest, redactions in insta, scrubbers in ApprovalTests. A reference
  that differs on every run teaches people to approve diffs without reading them.
- **Small references.** Snapshot the part of the output the test is about. A diff of a few lines gets read; one of
  a thousand gets approved by habit.
- **A corpus with ceilings, where one reference per output is too many.** For output whose quality is a measure,
  such as a layout or a rendering, keep a corpus of inputs and approve ceilings over the whole: no structural
  violations, and a maximum and a 95th percentile for each measure. A family of inputs built to be hard gets its own
  ceilings, so it cannot use up the headroom of the others. A report lists the worst fixtures per measure for the
  person who approves a new ceiling. When a change improves a measure, the ceiling comes down, so the next regression
  shows.
- **A model can sort the differences first.** A reviewer agent with a fresh context marks each changed reference
  expected or unexpected against the requirement, with its evidence. Its verdict is advice until it is calibrated on
  differences a person has sorted, and the person still approves every new reference.

## Where it does not apply

Output that differs on every run by nature, such as a model's free text, has no stable reference: test its
structure, or run it through evals. An output too large for a person to read in a diff is better held by a few
assertions on what matters.
