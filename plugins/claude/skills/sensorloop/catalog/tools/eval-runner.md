---
title: Eval runner
summary: Runs a suite of cases against a prompt, a model or an agent many times, and scores each case's assertions.
sensors: [eval-set]
layer: project
vendors:
  - name: promptfoo
    url: https://www.promptfoo.dev/
  - name: Inspect
    url: https://inspect.aisi.org.uk/
    note: Python
  - name: DeepEval
    url: https://deepeval.com/
    note: Python
  - name: Claude Code
    url: https://code.claude.com/docs/en/headless
    note: "`claude -p` once per case; `claude plugin eval` runs a plugin's eval cases"
  - name: Codex
    url: https://learn.chatgpt.com/docs/non-interactive-mode
    note: "`codex exec` once per case"
---

One good run of a model proves little. The runner turns many runs into a pass rate per case and overall, the Eval
set's signal. Look for the suite and the runner the project already uses before choosing one.

## Finding it

- **A suite in the repository**: a config such as `promptfooconfig.yaml`, or a folder of cases with their expected
  answers.
- **The task file or the CI job** that runs it, and the budget it is given.
- **An agent's headless mode**, when the work under test is an agent: `claude -p` or `codex exec`, which a script runs
  once per case.

When there is none, ask a person before building one: a suite costs money on every run.

## Using it

- **Repeat each case**: model output varies from run to run, so run each case enough times to see how far its result
  spreads between runs of the same version.
- **Give each run a fresh environment**, so one run's leftovers cannot help the next.
- **Compare paired arms**: the same cases with and without the change, on the same model version.
- **Budget the model calls**: cases times repeats times arms times the cost of one case run (every model call made in
  it), with a cap the run stops at.
