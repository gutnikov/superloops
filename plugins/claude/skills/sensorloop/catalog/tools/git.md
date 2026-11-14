---
title: git
summary: "The repository itself, read through git: the diff, the log, the state of the tree, branches and worktrees."
sensors: [repository-state]
layer: project
vendors:
  - name: Git
    url: https://git-scm.com/
    note: "`git diff`, `git status --porcelain`, `git log`, `git worktree`"
---

git reads the repository directly: the diff, the log, the state of the tree, its branches and worktrees. The facts
about a change come from it, not from the agent's own account of what it did.

## Finding it

Every project under git has it. `git rev-parse --show-toplevel` names the repository's root, and `git worktree list`
shows the other checkouts of the same repository.

## Using it

- **Read machine-readable output**: `git status --porcelain`, `git diff --name-only`, `git diff --numstat`, so a
  script reads facts rather than a summary meant for people.
- **Compare with the right base**: fetch the target branch first (`git fetch origin main`), then diff against its
  merge base (`git diff origin/main...HEAD`). Without the fetch, a stale local `origin/main` gives the wrong base.
- **Read git, not the report**: a hook or a script takes the fact from git (tests touched, a dirty tree, commits
  ahead) instead of asking the agent.
- **Look for leftovers**: `git diff --check` reports conflict markers and whitespace errors left in the change.
