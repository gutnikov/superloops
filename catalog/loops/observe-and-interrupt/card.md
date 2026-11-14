---
title: Watch and step in
summary: The person does not approve each step. They watch the agent work and step in when it drifts; the agent stops at once, the drifted work can be rolled back, and the correction becomes the agent's next instruction.
sensors: [live-supervision]
when: While the agent works on a task the person chose to watch, at any step. Whether a task is watched is decided before it starts.
failure: "The person interrupts: the agent misread the task, took a wrong approach, touched a file it should not have, or spent effort out of proportion to the problem. An interruption that adds a requirement, or changes the person's mind, is new input rather than an error."
next: "The agent stops mid-step, keeps the work so far and takes the correction as its next instruction; when the person only says stop or undo, it asks what was wrong before it goes on. The person rolls back drifted work that should go. After two corrections of the same thing that did not take, the person clears the context and writes one better prompt instead of a third. The person is already there, so nothing is handed over: the loop ends with the task, and each correction is recorded with the work."
---

## The loop

1. Before the task starts, the person decides whether to watch it. A task that is ambiguous, hard to undo or hard to
   review once finished is worth watching: a schema migration, a design decision, anything that touches production.
2. The agent works without asking approval for each step. Before each step that changes something, it writes one
   line: what it did, and what it does next.
3. The person watches, most closely in the first minute, and stops the agent the moment it drifts. In Claude Code,
   `Esc` stops it mid-action and keeps everything done up to that point.
4. If the drifted work should go, the person rolls it back: the code alone, so the agent still sees what went wrong,
   or the code and the conversation together, to start the step over. In Claude Code, `/rewind` or `Esc` twice at an
   empty prompt opens the list of earlier prompts to go back to.
5. The person gives the correction: what was wrong, and what to do instead. The agent goes on from there.
6. After two corrections of the same thing that did not take, a third only adds to a conversation that already holds
   two failed attempts. The person clears the context and writes one new prompt that folds in what was learned.
7. The correction goes where the next task reads it: the spec, a test, the agent's instructions. The same kind of
   correction twice becomes a rule that another sensor checks.

## Why

Approving every step spends the person's attention on steps that are fine, and the approvals soon become a formality.
Watching costs less: the person steps in only when the work drifts, and catches a wrong turn while it is still cheap.
Anthropic found that experienced Claude Code users auto-approve more than new ones and also interrupt more, in about
9% of turns against 5%, most often to give missing technical context or a correction. The loop works only while the
person is watching.

## Set up

- **A rollback covers only what the checkpoints cover.** Claude Code's checkpoints restore files Claude edited with
  its own file tools, not a file a shell command changed, and nothing brings back a sent message or a migration
  already applied. Some agents capture more: opencode snapshots the whole working tree at each step, in a separate git
  directory. Where checkpoints cover only the edit tools, run the agent in its own git worktree and commit at each
  point the person may want to return to.
- **Watching stops the next step, not one that has run.** An action that cannot be undone still waits for a person's
  yes, watched or not.
- **A refused step need not end the run.** Tell a subagent that may meet a refusal to acknowledge it, try another
  approach, and report the blocker if it cannot go on without the refused step, as gemini-cli tells its subagents.
- **A correction need not stop the step.** Some agents queue a message typed during a step and give it to the model
  before its next call, as pi's steering queue does; stopping the step is then a separate action.
- **The agent records each correction** in the project's outcome log, with its kind and the phase that should have
  caught it: the spec, when it was silent, or a check, when one was missing. Counted by phase, the corrections show
  where a loop is missing.

## Where it does not apply

A run nobody watches, such as a CI job or a scheduled agent. There the loops that need no person carry the work, and
a review of the result at the end takes this loop's place. A task whose drift the person could not tell from progress
needs its direction settled before it starts, not a watcher.
