---
title: The agent's hooks
summary: "Commands the coding agent runs before and after each tool call, when a call needs permission, and when it is about to stop: a hook can record a call, refuse it, answer the permission prompt, or keep the agent from stopping."
sensors: [agent-activity]
layer: agent
---

A hook sees each tool call as it happens, before or after it runs. Hooks are the live source of the Agent activity
sensor: they record the calls the sensor reads for patterns, and they can refuse a call, or the agent's stop, before
it takes effect.

## Finding it

They are set in the coding agent's settings. In Claude Code, that is the `hooks` section of `.claude/settings.json` in
the project or of `~/.claude/settings.json` for the user, and `/hooks` lists the configured ones. Cursor reads them
from `.cursor/hooks.json`. A hook runs with the user's full rights, so a person reviews each one before it is added.

## Using it

- **Record**: a `PostToolUse` hook appends each call and its result to a log, and a `PostToolUseFailure` hook each
  call that failed. The Agent activity sensor reads that log for patterns such as the same call repeated or a tool
  that keeps failing.
- **Refuse**: a `PreToolUse` hook that exits with code 2 blocks the call, and what it writes to standard error goes
  back to the agent as the reason. Any other non-zero exit code counts as an error of the hook, and the call goes
  ahead.
- **Answer a permission prompt**: a `PermissionRequest` hook runs when a tool call needs a permission decision, where
  the agent would otherwise ask the person, and can allow or deny the call in their place, for example with a
  reviewer model's verdict. It gives no answer for the commands a person must confirm, so the person is still asked.
- **Keep the agent working**: a `Stop` hook runs the project's checks, such as its tests and linter, and when they
  fail it exits with code 2, with the failure as the reason. The hook's input says whether the agent is already
  continuing because of a stop hook (`stop_hook_active`). The hook reads it, or counts its own blocks, and after a few
  failed attempts lets the agent stop and report the failure to a person, so checks that never pass do not hold the
  agent forever.

A hook runs on every call it matches, so a slow hook slows each of them. Keep hooks fast, and match only the tools
they check (the `matcher` field in Claude Code).

Examples: Claude Code hooks (`PreToolUse`, `PermissionRequest`, `PostToolUse`, `Stop`), Cursor hooks (`preToolUse`,
`postToolUse`, `stop`).
