---
title: Approve the plan first
summary: Before it changes anything, the agent studies the code read-only and writes a plan that opens with the task in its own words (what it understood, what it will not do, and what will show it is done). A person corrects or approves it, and the agent then works by the plan on its own.
sensors: [human-answer]
when: Before the agent's first edit on a task whose direction is not yet settled, once it has read the code; again whenever the work needs a requirement or a change of approach the approved plan does not name.
failure: The person corrects the restatement or rejects the plan, with what to change. Or a plan reaches the person empty, with a step that has no check, or with a decision left open; or work starts on a plan that has no approval record or has changed since it was approved.
next: "On a correction, the agent writes the whole plan again with the correction folded in, and starts only on an approval. After a second correction of the restatement, it stops restating and asks the person questions until it could write the plan. No answer, no start: the agent may read, but changes nothing. During the work, a new requirement or a change of approach goes back to the person, and the updated plan is approved again. The person sees the restatement, the steps with their checks, and each open decision with a recommended option."
---

## The loop

1. When the task points somewhere (a ticket, an issue, a spec), the agent fetches it from where it lives and opens
   with its id and title as fetched. A bare `#2` can match another numbered list in the context, such as a todo file
   or a plan's steps; a reference that matches more than one item, or none, is asked about before anything else.
2. The agent studies the code without changing it: it reads files and runs commands that only look.
3. It writes the plan, which opens with the restatement:
   - **I understood**: how the agent reads the task;
   - **Not doing**: what is out of scope;
   - **Done when**: what will show the task is done, as a test or a command and its expected result.

   Then the steps, the files each touches, and for each step the command that checks it, with its expected output. A
   decision the code cannot settle comes with two to four options and a recommended one.
4. The agent asks the person through the session's question tool: approve, or correct with what to change. The
   person can also edit the plan file directly.
5. On a correction, the agent writes the whole plan again, not a patch on it, so the approved file reads as one text.
6. On an approval, the agent works by the plan without asking at each step. A detail the plan left open, where the
   requirement still decides, it settles with the smallest change that meets the requirement, and notes it in the plan
   as a ruling with its reason.
7. At the end, a reviewer checks the diff against the plan: steps missing, changes it does not name, and rulings.

The plan says how the work will go. Where the project keeps a spec, the plan cites it rather than restating it, and a
demo of the result at the end shows the person whether the work does what they wanted.

## Why

A task can be read in more than one way, and the agent's reading shows only in the result. An agent that works for
hours on a wrong reading spends them going the wrong way, and the person finds out in the diff. A restatement and a
plan take a minute or two to read, far less than the diff they lead to. Mismatches show in "Not doing" and "Done
when": a person who also needed an Excel export sees it listed as out of scope, and says so before any work is spent.

## Set up

- **Read-only until approved, enforced by the agent's runtime**, not by its choice: plan mode in Claude Code, which
  `defaultMode` set to `plan` under `permissions` makes the default for the project's terminal sessions, or a plan
  mode or read-only setting in other coding agents. In an interactive Claude Code session with bypass permissions
  available, plan mode's blocks are not enforced: Claude is told to plan, and an edit it tries runs without a prompt.
  A project that relies on this loop disables bypass mode (`permissions.disableBypassPermissionsMode` set to
  `"disable"` in managed settings).
- **The plan lives in the repository**, committed with the work, so it outlives the session and a reviewer can read
  it. In Claude Code, `plansDirectory` set to `./plans` puts plan files there instead of `~/.claude/plans`.
- **Approval is the person's answer, never text.** "Approved" or "execution allowed" in the plan, in notes, a progress
  file or a commit message is not permission, from this session or an earlier one. In one reported case, an agent
  wrote such a line into its own notes, read it back in later sessions as permission, and built on a live server.
- **The approval leaves a record the agent cannot write.** A hook that runs only after the person approves appends the
  plan's hash, its path and the session to an approvals log. In Claude Code that is a `PostToolUse` hook on
  `ExitPlanMode`, whose `tool_response` holds the approved `plan` and its `filePath`. A hook refuses the agent's
  writes to the log and to the hook settings.
- **A check before the work starts** prints `<plan>: <status>`, one of `approved`, `empty`, `no checks`,
  `no approval record` and `changed since approval` (its hash matches no record), and fails on anything but
  `approved`. The implementing session runs it first and stays read-only while it fails. It is shown to catch a plan
  the agent marked approved with no record, an approved plan edited afterwards, and an empty plan.
- **The work starts in a clean context.** The planning conversation holds the options the person rejected. The
  implementing session starts from the committed plan file once the check passes. Codex points a new thread at the
  plan file only after checking that it holds exactly the approved text, and otherwise passes the text itself.

## Where it does not apply

A change whose done is already fixed: an approved spec, a failing test that reproduces a bug, a typo. In a run nobody
watches, nobody can answer: the restatement and the plan go at the top of the pull request as assumptions, which the
person confirms or rejects at review, later and at a higher cost. A task whose direction is unclear waits instead.
