---
title: Tests against a scripted model
summary: Code around a model, such as the agent loop, tool dispatch, retries and compaction, is tested against a fake provider that replays scripted replies and tool calls. The tests run in CI with no network and no tokens and give the same result every time, so a failure points at the code, not at a bad answer.
sensors: [test-runner]
when: On every change to the code around the model, before the agent says it is done; in CI on every pull request; and when a bug in that code is reported, before it is fixed.
failure: A failed test. The fake also fails it on a request the script holds no reply for, on a scripted reply that is never requested, on a request the provider would reject (a tool result with no call), and on any request to the network.
next: The agent fixes the code and runs the suite again. It changes a script only when the reply it holds is wrong, never to make a failure go away, and a recorded script that changed goes to a person as a diff. After three rounds with the same test red, it stops and shows a person the test, its script and the failure. A bug that shows only with a real model goes to the evals or to a run against the real model, and the agent says so instead of calling it fixed.
---

## The loop

1. A test registers a fake provider and gives it the replies to return, in order: text, thinking, tool calls with
   their arguments, or a function that builds a reply from the request it gets.
2. The code under test runs as in production: it sends requests, runs the tool calls the script asks for, and sends
   the results back.
3. The test asserts on what the code did: the events it emitted, the messages it kept, the tools it ran, what it did
   on an error or an abort.
4. The fake checks every request as well, whatever the test asserts, and fails the test on a request it cannot
   answer, a reply left unused, or a history the provider's rules forbid.
5. A reported bug in this code becomes a script that reproduces it, red before the fix, named after its issue, such
   as a slash command queued while a tool runs, or a retry after a lost connection.

## Why

Code around a model has bugs of its own: the agent loop, tool dispatch, retries, compaction, a queue of the user's
messages. A real model makes them hard to test: each run differs, costs tokens, and needs a key and the network.
Evals run the real model on a suite of cases, several times, and measure the pass rate; a drop there cannot tell a
regression in the loop from the model answering worse. A scripted model fixes the model's side, so one run decides,
and a failure points at the code. The two split the work: evals check what the model answers when a prompt, a tool
description or the model changes; these tests check that the code does the right thing with whatever comes back.

## Set up

- **A fake provider and a harness** in the test library: helpers that build text, thinking and tool-call replies,
  and a harness that builds the session around the fake, so a test states only its script and its assertions.
- **A rule that the suite uses it**, where the agent reads its instructions: no real provider APIs, keys, network
  calls or paid tokens. Tests that need a real model live apart and run only where their credentials are present.
- **No way out.** The test command runs the suite in a temporary home with an empty environment, so no real key is
  within reach. The harness replaces the HTTP client and fails the test on any request beyond the local machine, even
  when the code under test catches the error and goes on.
- **Long scripts are recorded, not written.** Run the code once against the real model and keep each reply, as a
  file of model responses or a cassette of the HTTP traffic. Replay in order; a looser mode takes the next reply of
  the right kind, for calls whose order varies.
- **Recording is deliberate.** It happens only when asked for: an environment variable, or deleting the recordings
  to refresh, which shows in the diff which ones were refreshed. In CI a missing recording fails the test; it never
  records and never skips, since a skip lets a deleted recording remove its test unseen.
- **A recording is checked before it is committed.** The recorder scans it for credential formats and for the values
  of secret-looking environment variables, and fails instead of writing it when it finds one. A person reads the
  diff, since a reply can hold details of the machine or the person who recorded it.
- **The provider's rules in the fake, once**: for example, every tool result has its call in the same request, and
  every call its result. Then every test checks the history after a compaction, an abort or a resume.
- **Exact counts.** Each scripted reply is requested exactly once: a path that skips a call fails, as one that makes
  an extra call does.
- **A reply held mid-stream.** The fake holds one event of the stream until the test releases it, so the test can
  interrupt, steer or queue input at that exact point.
- **Wiring.** The project's test command runs the suite locally and in a CI job on every pull request. Code owners
  on the recordings make a person's review required for any change to them.

## Where it does not apply

A script proves the code, not the seam. Where the code's job is the seam itself (starting a real agent CLI, its
keys, its stream format, a sandbox), a fake skips what breaks. There, a run of the real agent on its cheapest model
asks for one fixed artefact, such as a file holding one line, and checks what it reads back, never the model's
wording; the agent's own record shows that the model ran. A missing key makes that run unverifiable, not a pass. A
script replays only what someone recorded, so a bug that depends on what a model says for the first time is left to
the evals and to production.
