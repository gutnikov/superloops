---
title: The agent's permission rules
summary: The coding agent's rules for which actions run, which are refused, and which go to a person or a model first.
sensors: [human-answer, llm-judge]
layer: agent
vendors:
  - name: Claude Code
    url: https://code.claude.com/docs/en/permissions
    note: allow, ask and deny rules, and its auto mode
  - name: Codex
    url: https://learn.chatgpt.com/docs/security
    note: an approval policy and a sandbox mode
  - name: Gemini CLI
    url: https://geminicli.com/docs/reference/policy-engine/
    note: rules of its policy engine
---

An allow rule lets a matching action run, a deny rule refuses it, and an ask rule puts it to a person (the Human
answer). An action no rule matches follows the agent's mode: the default mode asks the person too, and an automatic
mode can hand the decision to a model (the LLM judge).

## Finding it

- **Claude Code**: `permissions` in `.claude/settings.json` (committed with the project), `.claude/settings.local.json`
  and `~/.claude/settings.json` (each person's own), with an organisation's managed settings above them.
- **Other coding agents**: an approval policy and a sandbox mode in their config (`~/.codex/config.toml` for Codex).

## Using it

- **Write a rule as a tool and a pattern**: `Bash(npm run test *)` allowed, `Bash(git push *)` asked, `Read(./.env)`
  denied.
- **Deny wins over ask, and ask over allow**, even when the rules come from different settings files.
- **Ask before actions that cannot be undone** (a push to the main branch, a delete, a deploy): an ask rule puts them
  to a person even in a mode where a model decides the rest.
- **Deny what must never run**, such as reading a secrets file: no allow rule can override a deny rule.
- **Let a model decide the rest**: in Claude Code's auto mode, a classifier model reviews the actions no rule settles
  (reads and edits in the working directory aside) before they run, and blocks those that go beyond the request,
  such as a force push or a production deploy.
- **Review rule changes like code**: a change to the committed settings file goes through the project's review.
