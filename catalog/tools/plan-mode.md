---
title: Plan mode
summary: A mode in which the coding agent may only read and plan, until a person approves the plan.
sensors: [human-answer]
layer: agent
vendors:
  - name: Claude Code
    url: https://code.claude.com/docs/en/common-workflows
    note: Shift+Tab, `/plan`, or `--permission-mode plan`
  - name: Codex
    url: https://learn.chatgpt.com/docs/developer-commands?surface=cli
    note: "`/plan`"
  - name: Cursor
    url: https://cursor.com/docs/agent/plan-mode
    note: its plan mode
---

The agent explores the code and writes a plan. The person approves it, or rejects it and says what to change, before
any file is edited. The approved plan is a Human answer: what the later work is checked against.

## Finding it

- **Claude Code**: Shift+Tab cycles through the permission modes. From the default mode, the first press turns on
  accepting edits and the second reaches plan mode; the status bar then shows `⏸ plan mode on`. `/plan` before a
  prompt also switches into it, `claude --permission-mode plan` starts in it, and `defaultMode` in the settings'
  `permissions` makes it the default.
- **Other coding agents**: a plan mode of their own, or a read-only approval setting.

## Using it

- **Use it for work whose direction a person should settle first**: a change across many files, a migration,
  anything hard to undo.
- **Ask for a plan that names** the files to change, the steps, and how each step will be checked.
- **Keep the approved plan** with the work, in the repository, the task or the pull request, so later work can be
  checked against it.
- **Reject with a reason**: the person says what to change, and the agent plans again.
