---
title: The agent's question tool
summary: The coding agent's way to put a question to a person, with a few options and a free answer, and wait for it.
sensors: [human-answer]
layer: agent
vendors:
  - name: Claude Code
    url: https://code.claude.com/docs/en/tools-reference
    note: "`AskUserQuestion`"
---

A question with options takes a person seconds to answer, where an open one starts a conversation. The choice comes
back to the agent as an answer it can act on: the Human answer.

## Finding it

- **Claude Code**: the built-in `AskUserQuestion` tool.
- **Other coding agents**: look in the agent's list of tools for one that offers the person options and waits for the
  choice. An agent without one asks in the chat and ends its turn until the person replies.
- **The agent's settings** can allow or deny the tool like any other.
- **In an unattended run** there is no one to answer: the agent states its assumption where the person will see it,
  in the task or the pull request, and goes on; the person confirms it later. Before an action that cannot be undone,
  it stops and waits instead.

## Using it

- **Two to four options**, the recommended one first and marked so; a free answer is always possible.
- **One decision per question**, with what each option costs: time, risk, and whether it can be undone.
- **Ask before an action that cannot be undone**, not after it.
- **Keep the question and the answer** with the work, in the task or the pull request, so the decision can be found
  later.

For example: "The migration drops the `legacy_id` column. How should it run?", with the options "Copy the column to a
backup table first (Recommended): one more minute, can be undone" and "Drop it now: faster, cannot be undone".
