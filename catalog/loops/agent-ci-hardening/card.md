---
title: Agents in CI keep their guards
summary: "A CI check finds every workflow job that runs a coding agent, and fails when one lacks a guard: a filtered network, a permission mode that reviews calls, a tool list and a turn cap, or a job with no write token where the agent reads text anyone can write."
sensors: [structure-check, security-scanner]
when: On every pull request and every push to the main branch, over all the workflows and the actions they call.
failure: "An agent job on a runner whose outbound traffic is not filtered, or with an allow list that is missing, empty, not enforced or names a host with `*`. An agent step that turns permission checks off, sets a default permission mode, loads a policy that allows shell commands and file writes outright, or names a model too old for the chosen mode. A step with no tool list or no turn cap. In a job whose trigger carries text anyone can write: a token that can write, a checkout that keeps its credentials, or that text pasted into a prompt or a command. A third-party step not pinned to a commit. Fewer agent jobs found than the repository lists."
next: The author of the change, an agent or a person, puts the guard back; each problem's message names the fix. A job that cannot meet a rule goes into the script's exemption table with a reason, which a person reviews and every run prints. The check is never skipped or weakened to pass, and the change does not merge while it is red. A change that lets people without write access trigger an agent also gets a one-time warning on its pull request, for a person to read.
---

## The loop

1. A script reads every workflow and finds each job that runs a coding agent, by more than one pattern: the agent's
   action, its sign-in inputs spelled with `_` and with `-`, the name of its key, a step that calls its command
   line. The rules list the repository's agent jobs, and finding fewer fails: a check that looked for one spelling
   would miss a job signed in with the other, and report "nothing to check" as a pass.
2. For each agent job, it checks the guards:
   - **The network is filtered.** The job runs on a runner that filters outbound traffic, against an allow list kept
     in the repository, in enforce mode, not empty, with every host named in full.
   - **Permissions are reviewed, not off.** Every agent step sets the permission mode the project chose. In Claude
     Code, `--permission-mode auto` lets a call the allowed tools do not cover run only if its safety review passes
     it, and an older model falls back to the default mode, so the model is checked too; other coding agents have
     their own setting. No step passes `--dangerously-skip-permissions`, sets a default mode anywhere in the job (an
     earlier step can write the settings file), or loads a policy that allows shell commands and file writes.
   - **The agent's reach is listed**: a tool allow list and a turn cap on each step, such as one tool that reads
     files and 25 turns for an agent that labels issues.
   - **Untrusted text meets no write token.** When the trigger carries text anyone can write (an issue, a comment, a
     pull request's title, release notes), the agent's job only reads, its step holds no token, its checkout keeps
     no credentials (`persist-credentials: false` in GitHub Actions), and the text reaches the agent as a file, never
     through `${{ }}` in the prompt or a command. A separate job with one narrow write scope applies what it proposed.
   - **A fork's code meets no secret.** A `pull_request_target` job runs only for the repository's own branches, and
     a job that checks out a commit another run handed over waits for a person's approval before any step with a
     secret.
   - **Every third-party step is pinned** to a full commit SHA, so a moved tag cannot change what runs.
3. Each problem is one line that names the workflow, the job and the fix, such as `add '--permission-mode auto' to
   'claude_args' under the step's 'with:'`, and each exemption is printed with its reason. Any problem fails the job.

## Why

An agent in CI runs with nobody watching: it labels issues, reviews pull requests, fixes what a bot asks. Its guards
live in the workflow file, as a runner label, a flag, a model name and the token in its environment, and one edit
drops any of them without a test failing. The job still succeeds, now able to reach any host, run any command or
write to the repository, often on text a stranger wrote in an issue. Each guard holds where another fails: a review
that a prompt injection talks its way past still cannot reach a host the firewall blocks, or write with a token the
agent never held.

## Set up

- **The rules where an agent reads them**, in the project's agent instructions (CLAUDE.md, AGENTS.md or the
  equivalent), ending with "Do not skip or weaken the check."
- **The allow list as a file**, each host with a line on what uses it.
- **Exemptions are lines in the script**, keyed by workflow and job, each with a reason every run prints, and each for
  one rule: a job exempt from the permission mode that sets any mode still fails.
- **A workflow security scanner alongside**, over every workflow, not only the agent jobs: for GitHub Actions, zizmor
  reports untrusted input pasted into commands and permissions wider than needed.
- **The model's credential is short-lived and out of the agent's reach**: a token from the CI's own identity (OIDC)
  that expires in minutes, where the provider accepts one; no login file the agent's shell can read; and an agent job
  that cannot sign in fails instead of skipping.
- **A warning for a person.** A second check comments once on a pull request that lets users without write access
  trigger an agent.
- **Out of the agent's reach.** The check is a required job. Code owners review the workflows, the actions they call
  and the script, so an agent cannot loosen a guard and its check in one change.

## Where it does not apply

The check reads the workflows, not the runs: it shows that the guards are written, not that they hold. It covers the
agents a project runs in CI; the gates of an agent's session on a person's machine are a different check. A project
with no agent in CI has nothing to check, as long as its list of agent jobs is empty too.
