---
title: Interrupt and rewind
summary: The coding agent's controls to stop it in the middle of a step, and to roll its changes back to an earlier point.
sensors: [live-supervision]
layer: agent
vendors:
  - name: Claude Code
    url: https://code.claude.com/docs/en/checkpointing
    note: Esc to stop; `/rewind` to go back to a checkpoint
  - name: Cursor
    url: https://cursor.com/docs/agent/overview
    note: checkpoints
  - name: Gemini CLI
    url: https://geminicli.com/docs/cli/checkpointing/
    note: "`/restore`, once checkpointing is on"
---

They are how a person watching the work turns a drift into a correction: a stop before more is built on a wrong turn,
and a way back to before it.

## Finding it

- **Claude Code**: Esc stops the current step and keeps the work done so far. Esc twice at an empty prompt, or
  `/rewind`, opens the list of earlier prompts to go back to, each with its checkpoint.
- **Other coding agents**: a stop key or button, and checkpoints of the files they edit, such as Cursor's checkpoints
  or Gemini CLI's `/restore` once checkpointing is turned on.
- **What checkpoints miss**: changes made by shell commands (a migration, a file a script wrote). Git brings back only
  what was committed before the step, and nothing rewinds a migration already applied to a database. So commit
  before a risky step, and apply migrations to a database that can be thrown away.

## Using it

1. **Interrupt early**, when the direction is wrong, not after the step finishes.
2. **Rewind, if the drifted work should go**: the code alone keeps the conversation, so the agent still knows what
   went wrong; the code and the conversation together start the step over.
3. **Give the correction** as the next instruction: what was wrong, and what to do instead.
4. **Record the correction**: one made twice should become a rule another sensor checks, such as a lint rule or a
   test.
