---
title: Isolated environment
summary: "An environment of its own for each agent run: its own checkout, dependencies, network rules and secrets."
sensors: [isolation-probe]
layer: system
vendors:
  - name: git worktree
    url: https://git-scm.com/docs/git-worktree
    note: a checkout per run
  - name: Dev Containers
    url: https://containers.dev/
    note: the environment as a container, described in the repository
  - name: Nix
    url: https://nixos.org/
    note: the tools at exact versions, described in the repository
  - name: Claude Code's sandbox
    url: https://code.claude.com/docs/en/sandboxing
    note: the paths the agent may write and the hosts it may reach
  - name: GitHub Codespaces
    url: https://github.com/features/codespaces
    note: a dev container in the cloud, per branch
  - name: E2B
    url: https://e2b.dev/
    note: cloud sandboxes for agent runs
---

Each agent run gets an environment of its own, so the same code gives the same signal and runs side by side do not
collide. The environment sits around the project rather than in its code: files in the repository and the agent's
settings describe it, and the run takes place inside it. How it is built depends on both, so look in their
configuration rather than assume a default.

## Finding it

- **The project's setup**: a dev container (`.devcontainer/devcontainer.json`), Nix files (`flake.nix`,
  `shell.nix`), a Compose file for the services it needs.
- **The agent's sandbox settings**: the paths it may write and the hosts it may reach.
- **Worktrees already in use**: `git worktree list`.

## Using it

- **One checkout per run**: `git worktree add <path> -b <branch>`, removed with `git worktree remove <path>`.
- **Services per environment** (a database, a log store), on their own ports or network, so two runs share no state.
- **Outbound network on an allowlist**: the package registry and the code host, nothing else by default.
- **Only the secrets the task needs**, and only those of test accounts, never production ones.
- **Nothing left after the run**: the checkout, the services and their data removed, and the secrets revoked or
  expired.
