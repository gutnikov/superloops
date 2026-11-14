---
title: Does the skill load when it should
summary: Realistic requests that should and should not use a skill, a subagent or a command run several times each, and the eval counts how often the agent loads it. A rewritten description is kept only if it does better on requests it was not tuned on.
sensors: [eval-set]
when: On every change to the description of a skill, a subagent or a command, to the coding agent or to the model it runs on; and on demand, when a person asks to tune a description.
failure: A request that should load it does so in fewer than half its runs, where a load after other work has started counts as none; a request that should not load it does so in half its runs or more. Also a description that does not parse, or never reaches the model.
next: The agent rewrites the description from the failures of the training requests only, for at most five rounds, and keeps the version with the best score on the held-out requests. A person reviews the chosen description, and any change to the requests, like any change to the skill. When no version passes the held-out requests, the person gets the failing requests with their rates, and decides whether to narrow the skill, settle its overlap with another or drop a request.
---

## The loop

1. **The requests.** About 20, written the way people type: file names, some context, lowercase, a typo. About half
   should load the skill, phrased in different ways, some without naming it or its file type, some a few turns into a
   session. The other half should not: near-misses that share its keywords but need something else, never requests
   so unrelated that they test nothing. A person reviews the set.
2. **A run.** Each request runs three times, each in a fresh headless session with the description installed. It
   counts as loaded only when the agent's first action, todo and planning tools aside, loads that skill. A later load
   is reported as `late` and counts as not loaded: by then the agent has started the work its own way.
3. **The rate.** A request that should load passes at a load rate of one half or more; one that should not passes
   below one half. The runner prints one line per failing request,
   `<request>: expected <load|no load>, rate <r> over <n> runs`, then the totals.
4. **Tuning, on demand.** The requests are split 60/40 into a training set and a held-out set, each with the same mix
   of should and should not. A model rewrites the description from the training failures only, and never sees the
   held-out scores. It stops once every training request passes, or after five rounds.
5. **The pick.** The version with the best held-out score wins, not the one with the best training score: a
   description can fit the requests it was tuned on and fail on new ones.

A request that passes at a rate near one half is not settled: add requests around it.

## Why

A skill, a subagent or a command is chosen by its description. One that would help still fails when the agent does
not pick it for the task it was written for, or picks it for a task that only shares a keyword. Both failures are
silent: the agent does the work some other way, and no check reports it. Several runs turn a lucky load into a rate,
and the held-out requests show how the description does on requests nobody tuned it on.

## Set up

- **First, the description reaches the model.** The front matter must parse: in one collection, an unquoted
  colon-space made six skills invalid YAML, and the installer skipped all six. For each coding agent it ships to, a
  nonsense token put in the description must show up in a fresh session's context.
- **Rules for the description**, checked by a script: it says when to use the skill, not its steps, since an agent
  may follow a summary of the steps instead of reading the skill (a description that said "code review between
  tasks" got one review where the skill asked for two). One project's check: it starts with "Use when", stays under
  1024 characters, and avoids process words such as "then" and "step".
- **The runner** reads the tool calls from the coding agent's event stream: a script over `claude -p` with
  `--output-format stream-json`, or the equivalent in other coding agents; a plugin eval runner such as
  `claude plugin eval`, with requests tagged to load or not and a grader on the skill tool's call; or Anthropic's
  skill-creator, whose loop does the split and the pick.
- **Each model and agent it ships to**, and a cheaper model with a real user's instructions file, such as CLAUDE.md:
  a model that loads skills more readily can fire the same description far too often.
- **Chained loads.** A skill that names another does not reliably load it, nor does a subagent inherit a skill's
  directive from its parent. A case runs the parent, and passes only when the trace, subagents included, shows a load
  of each skill its steps name. A step names the tool call, such as `Call the Skill tool with "grilling"`, not
  `/name`.
- **Misses in use become requests.** A weekly read of the session transcripts lists each request that matches a
  description with no load, and each late load. A person decides which were misses, and each joins the set.
- **Skills compete.** A request two skills fight over goes into both sets, with the answer decided once.
- **Out of the agent's reach.** The model that rewrites the description never sees the held-out requests or their
  scores. The requests have code owners, so no description passes because its requests were edited.

## Where it does not apply

A skill that only a person starts by name, and the model never chooses, has no trigger to tune: check that it parses
and is listed.
