---
title: Session transcripts
summary: "The transcript the coding agent keeps of each session: the prompts, the tool calls and their results."
sensors: [agent-activity, loop-outcomes]
layer: agent
vendors:
  - name: Claude Code
    url: https://code.claude.com/docs/en/monitoring-usage
    note: a JSON Lines file per session under `~/.claude/projects/`; OpenTelemetry events
  - name: Codex
    url: https://learn.chatgpt.com/docs/codex
    note: files under `~/.codex/sessions/`
---

Read afterwards, and across many sessions, transcripts show what the agent actually did, where a hook sees one call at
a time.

## Finding it

The agent decides where it writes them. Claude Code keeps one JSON Lines file per session under `~/.claude/projects/`,
in a directory named after the project's path, and Codex keeps its own under `~/.codex/sessions/`. An agent that
exports OpenTelemetry events sends them to the collector named in its settings.

## Using it

- **Read them in batches, on a schedule**: patterns show across many sessions, not in one.
- **Parse the entries**: in Claude Code's and Codex's transcripts each line is one JSON object, and `jq` picks out the
  tool calls, their results and their errors. On a Claude Code file, for example:
  `jq -c 'select(.type == "assistant") | .message.content[]? | select(.type == "tool_use") | {name, input}'`.
- **For Agent activity**: look for the patterns that sensor names, such as the same call repeated, a tool that keeps
  failing, or an edit with no failing test on record.
- **For Loop outcomes**: find the corrections, where a person's message changes work the agent had called done.
- **Scrub before sharing**: transcripts hold file contents, command output and any secret a tool read. Remove the
  secrets, and any file contents that must not leave, before anything leaves the machine.
- **Keep them long enough**: Claude Code deletes transcripts after 30 days by default (`cleanupPeriodDays`), so copy
  the ones you will need later before then.
