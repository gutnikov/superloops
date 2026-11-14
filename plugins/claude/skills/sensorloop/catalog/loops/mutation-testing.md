---
title: Tests that notice a change
summary: The agent checks its tests from outside. Coverage of the changed lines shows code no test runs, mutation testing on the changed files shows changes to the code no test notices, and each gap gets a test that fails on it.
sensors: [coverage-mutants]
when: Before the agent says a change is done, once its tests pass; in CI on every pull request; and on a schedule over the whole code, and for each written concern, such as data leaks, over the code it covers.
failure: A changed line or branch no test runs, coverage of the diff under its threshold, coverage of the whole code more than a tenth of a point under its floor, or a surviving mutant in a changed file that is not on the reviewed list of equivalent mutants. A coverage report or a mutation run that observed nothing is a failure too.
next: The agent writes a test for each gap and runs the check again; it never lowers a threshold, excludes code or narrows what is mutated. A mutant it judges equivalent goes on the list with a one-line reason, which a person reviews in the pull request. After three rounds with the same gaps open, it stops and hands a person the uncovered lines and surviving mutants, with the tests it tried. A run for a concern ends in a pull request of tests only, which a person reviews and merges.
---

## The loop

1. The change passes its tests. The agent runs them with coverage, branches included, and reads the lines and
   branches of the diff that no test ran. For each, it writes a test that runs the code and checks its result.
2. It runs the mutation tester on the changed files. The tester makes small changes to the code, called mutants,
   such as `<=` for `<` or a call removed, and runs the tests against each. A mutant no test fails on survives.
3. For each survivor, the agent writes a test that fails on it and passes on the real code. A mutant that changes no
   behaviour, an equivalent one, cannot be killed: the agent adds it to the list of accepted survivors with a reason.
4. A CI job runs both on the pull request. It holds the diff to a coverage threshold and the whole code to a floor
   that only rises, and fails on a survivor that is neither killed nor on the list.

Coverage is the cheap first pass, done in seconds: it finds code no test reaches. Mutation is the second: it runs
the tests once per mutant, and finds code the tests reach but do not check.

**For one concern**, such as data leaks, a model writes the mutants. The engineer who owns the concern describes it
in plain text ("a message is shown to an audience it was not meant for") and names the code it covers. The model
writes mutants that introduce that fault, drops those that change nothing or that the existing tests already catch,
and writes tests for the rest. A mutation run, not the model, then checks each test: it must fail on its mutant and
pass on the real code, and only the tests that do go into the pull request. The mutants are never committed. A
mutant the model calls equivalent, or could not kill in two attempts, is listed for the concern's owner: the model's
call is advice until it is calibrated against a person's, and nothing is dropped on it unseen.

## Why

A suite can pass and run every line and still miss broken behaviour, because a test that runs code does not have to
check its result. When the agent wrote both the code and the tests, the same reasoning shaped both, and they agree
by construction. Coverage and mutation check the tests from outside: a program changes the code and watches whether
any test notices. Tests written for behaviour can also all pass on a change that leaks data; mutants written for
that concern show where.

## Set up

- **Branch coverage, in a format other tools read.** Line coverage counts an `if` as covered when one side ran; turn
  on branches (`coverage run --branch` in coverage.py, for example). Write LCOV or Cobertura XML, and measure the
  diff with a diff-coverage tool such as diff-cover (`diff-cover coverage.xml --fail-under=80`).
- **A threshold on the diff, a floor on the whole.** A fixed bar on the whole code is the wrong tool: an old codebase
  sits far below any bar that means something. The whole code gets a floor that only rises. CI fails when coverage
  falls more than a tenth of a point under it (one commit can measure slightly differently on two machines), or when
  the change lowers the floor file against the main branch. After each push to main, a job raises the floor to what
  it measures, in a pull request. A person approves the diff threshold.
- **Mutate what changed while working**: `--incremental` or `--mutate` in Stryker, `--in-diff` in cargo-mutants, the
  changed files as the files to mutate in PIT or mutmut. Run the whole code on a schedule, with a timeout per mutant.
- **Hidden code counts as uncovered.** An exclusion comment such as `pragma: no cover` takes a line out of the
  report; a new one in the diff is reported as an uncovered line, so the agent cannot raise the number by hiding code.
- **Equivalent mutants are listed, not hidden.** The list is a file in the repository, each entry with its reason,
  and every addition shows in the pull request's diff.
- **A deleted test is measured on its own**, since its lines fit inside the floor's tolerance: it may go only when
  every line it alone covered is covered by another test.
- **Concerns run apart from the coding agent.** One file per concern, written by its owner. A scheduled job runs the
  model over the code changed since its last run, applies the mutants in a scratch copy, and opens a pull request
  that adds tests only: the job fails when it touches product code, and it never merges.
- **Out of the agent's reach.** A hook refuses the agent's writes to the coverage and mutation configuration (the
  files to mutate, the omit list, the thresholds, the floor), and CI reads the thresholds from the base branch, so a
  gap cannot be closed by no longer measuring it.

## Where it does not apply

A red suite: the tests must pass on the unchanged code first, or every mutant is killed and the score means nothing.
Neither check says whether the tests check the right behaviour, only that they would notice a change.
