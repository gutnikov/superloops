---
title: Check the claim of done
summary: When the working agent says a task is done, a separate agent with a fresh context gets the claim and the requirement, not the reasoning, and tries to prove the claim wrong by running the tests and the app.
sensors: [llm-reviewer, test-runner, manual-probe]
when: Each time the working agent says a task is done, before its turn ends or it opens a pull request; again after each fix, with a new refuter; and in CI on the pull request.
failure: The refuter returns fail with evidence that the claim is wrong, such as a test that fails or was skipped, a step of the requirement's scenario that does not work in the running app, or an example in the requirement left unmet. A refuter that could not run the tests or the app, timed out or returned no verdict has checked nothing, which is not a pass. Until the refuter is calibrated, a fail is advice.
next: The working agent fixes the work from the evidence and claims done again, and a new refuter checks from scratch. After three fails on the same claim the loop stops, and the person gets the claim, the requirement and each fail with its evidence, to decide whether the requirement can be met as written or the refuter is wrong. Until the refuter is calibrated, the agent reports its fail with the work, and the fail does not hold the turn.
---

## The loop

1. The working agent says the task is done, and states the claim: what now works, and how a user would see it.
2. A separate agent, the refuter, starts with a fresh context. It gets the claim, the requirement (the ticket, the
   spec or the acceptance criteria) and the range of commits; never the working agent's conversation, its reasoning
   or its report of the tests it ran.
3. It starts from the verdict fail and looks for evidence against the claim. It derives the diff itself, runs the
   project's tests, starts the app and walks the requirement's scenario the way a user would: a browser driver for a
   web app, a request for an API, a command for a command-line tool. It checks every example in the requirement, not
   only the one the working agent tried.
4. It returns a verdict: `fail`, with each reason and its evidence (the command and its output, or a screenshot);
   `pass`, with the commands it ran; or `unsure`, when the app did not start or nothing could run.
5. On a fail, the working agent fixes the work and claims done again, and a new refuter, with no memory of the last
   round, checks from scratch.

A code review reads the diff and asks whether the code is good. This loop runs the work and asks whether the claim is
true. A change can pass a careful review and still not do what was asked, and a refuter that saw the feature work says
nothing about how the code is built, so the two go together.

## Why

The agent that did the work judges it with the reasoning that produced it, and tends to confirm its own claim: "all
tests pass" with no output, a test skipped along the way, a feature whose unit tests pass and that breaks in the app.
A refuter gets only the claim and the requirement, has no stake in the work, and must show its evidence. A claim of
done then rests on what was run, not on the word of the agent that made it.

## Set up

- **Its definition**: a subagent, or a headless run such as `claude -p` or `codex exec`, whose prompt says to prove
  the claim wrong. It has tools to run the tests and drive the app, and none that edits files. It works in a scratch
  copy of the repository at the commit under test, so whatever a command writes is thrown away.
- **A fresh context, asked for.** Where a coding agent forks the parent conversation by default, the dispatch asks for
  a fresh one. The working agent's summary of what it ran stays out too: the refuter runs things itself.
- **Run, not read.** An orchestrator that hands tasks to workers checks each one the same way: it ignores the worker's
  log, runs the build, the tests, the linter and the type check itself, and reverts a task that fails.
- **A verdict the loop can parse**, through a JSON schema: the verdict, and for each reason the part of the claim it
  refutes, the command and its output. A pass with no command run counts as `unsure`.
- **For a fix**, named claims, each stated with confidence or not: every changed line serves the fix, the change opens
  no new hole, and every other caller gets the same results as before. A claim the refuter cannot establish fails.
- **A vote, where one refuter is not enough**: several refuters, blind to each other's verdicts. For example, four
  that find the claim holds confirm it, two that find a hole refute it, and no more start once the outcome is decided.
- **Calibrated before it blocks.** Its cases are claims known false (a feature whose unit tests pass and that fails
  in the app, a claim of done with a test skipped, an example in the requirement left unmet) and claims known true (a
  complete, correct change). It runs on each several times, and blocks only once its verdicts agree with the known
  answers at a rate a person approves.
- **Wiring.** The agent's instructions say to call the refuter when it claims done, and a hook before the turn ends
  refuses the stop while the last commit has no verdict; once the refuter is calibrated, a fail refuses it too. A CI
  job runs the same refuter on the pull request, outside the agent's session, so a skipped check still happens. A hook
  refuses the working agent's edits to the refuter's definition.

## Where it does not apply

A refactor claims only that behaviour did not change; the test run is its evidence, and a refuter adds little. A
document or a plan cannot be run: a reviewer reads it instead.
