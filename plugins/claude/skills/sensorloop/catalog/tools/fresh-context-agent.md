---
title: Fresh-context agent
summary: A separate agent run that starts with none of the working session's context, cannot change the work, and returns a structured verdict.
sensors: [llm-reviewer, llm-judge]
layer: agent
---

The run builds two sensors, and its prompt decides which. As an LLM reviewer it reads the work against a checklist and
lists findings, each with its `file:line` and severity. As an LLM judge it grades the work against a rubric: pass or
fail with a critique, or a score.

## Finding it

- **Subagents** defined in the agent's configuration: Claude Code reads them from `.claude/agents/`.
- **Headless runs** from the command line: `claude -p`, `codex exec`.
- **Review commands** the agent ships with or the project adds, such as `/code-review` and `/security-review` in
  Claude Code.

## Using it

- **Hand it the work to read** (a diff, a file, a spec) and a checklist, not the story of how the work was done.
- **Give it read-only tools**: the `tools` list in a subagent's definition, or `--tools` for `claude -p`; `codex exec`
  runs in a read-only sandbox by default. A run that must run the work, such as one that tries to prove a claim of
  done wrong by running the tests and the app, runs in a scratch copy of the work, so nothing it does reaches the
  working tree, and has no tool that edits the files it judges.
- **Ask for output the loop can parse**: a JSON schema, passed with `--json-schema` to `claude -p` or with
  `--output-schema` to `codex exec`.
- **Limit its run**, so a stuck review ends: `--max-turns` for `claude -p`, or a timeout around the command.

Examples: Claude Code subagents, `claude -p`, `codex exec`; the review commands `/code-review` and `/security-review`
that ship with Claude Code.
