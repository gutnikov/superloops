---
title: An unattended run ends in a hand-off or a reason
summary: After an agent runs with nobody watching, a wrapper reads git, not the agent's report, and either hands the work on or blocks the item with the reason and the one step that retries it. No item stays in progress after its run.
sensors: [repository-state]
when: Before an unattended run starts, on the item it was given; and after the agent's process exits, whether it finished, crashed or ran out of time.
failure: "Before the run: the item is a spec with sub-items, waits on an open blocker, is closed or done, or an open pull request from the project's own people already closes it. After it: no commit ahead of the base branch, conflicts left in the tree, a plan file that does not parse against its schema, a push the lease refuses because someone else moved the branch, or a run that crashed, timed out or fell silent."
next: "The wrapper decides, not the agent. On a pass it pushes, opens a draft pull request and starts the next task. On a failure it marks the item blocked, with a comment that gives the reason, the link to the run's log and the one step that retries it. Nothing retries by itself: a person reads the reason and starts the whole run again. A chain of runs that comes back to the same task, such as review and rework, stops after a few rounds, three for example, and waits for a person."
---

## The loop

1. A person starts the run, for example by adding a trigger label to an item. Before the agent starts, the wrapper
   refuses an item the run cannot finish, removes the trigger and says why on the item: a spec with sub-items, which
   the agent would try to build in one run; an item waiting on an open blocker; an item closed or done; an item that
   an open pull request from the project's own people already closes. Otherwise it marks the item in progress.
2. The agent runs on a fresh checkout, with a time limit on the job. A run silent for ten minutes is ended too.
3. When the agent's process exits, the wrapper reads git. Each check that fails writes one line to a reason file:
   - **commits ahead**: `git rev-list --count <base>..HEAD` is above zero, else "Agent finished but no commits were
     made on the branch.";
   - **no conflicts left**, when the run merged: no file is unmerged (`git diff --name-only --diff-filter=U`) and
     none holds a conflict marker;
   - **a valid plan**, when the run's output is a plan: it parses against its schema before anything is written, and
     on any problem nothing is;
   - **the branch unmoved**: the push carries `--force-with-lease=refs/heads/<branch>:<the commit the run started
     from>`, and a refusal is reported as "Branch advanced during the run."
4. All pass: the wrapper pushes, opens a draft pull request that closes the item, and adds the next task's trigger.
   Otherwise, a step that runs whenever the hand-off did not happen, a timeout included, marks the item blocked and
   comments with the reason, the run's link and the retry. A run that died before it wrote a reason gets one that
   points to the log. A step that always runs removes the in-progress mark.
5. The retry is the whole run, and a person starts it. Nothing inside the run retries itself: retrying a provider's
   errors blindly hides a bad prompt or a failed sign-in, and a retry that succeeds only runs the agent on a prompt
   built in a degraded environment. Only plumbing that gives the same result twice, such as adding a worktree,
   retries in place.

## Why

An agent with nobody watching can end with nothing to show: no commit, a plan that does not parse, conflicts left in
the tree, a branch someone pushed to meanwhile, a crash. Its own report can still say it is done. If the item stays
in progress, nobody learns that the run failed, why, or how to try again, and a next run that starts anyway builds on
nothing. The wrapper runs after the agent's process has exited, reads what the run left in git, and leaves the item
in one of two states: handed on, or blocked with a reason.

## Set up

- **The wrapper is in the same job, after the agent's step**, where the agent cannot skip it: the checks before, the
  checks after, and a `fail(<reason>)` that writes the reason file and exits non-zero. The job has a time limit, and
  a concurrency group keyed by the item, so a second run on it queues instead of racing (`cancel-in-progress: false`
  in GitHub Actions).
- **States as labels**: the trigger, in progress, blocked and the next task's trigger. A person adds a trigger, every
  retry and the merge; a run adds only the next task's trigger.
- **The agent holds no token** that can edit the item or push; only the wrapper's steps do.
- **A hand-off that starts nothing is a failure.** On GitHub, a label added with the workflow's built-in
  `GITHUB_TOKEN` starts no workflow, so the next task never runs and nothing turns red. Hand off with an app's
  identity or a personal access token, and with neither, block the item ("hand-off token missing") instead of
  falling back to the built-in token.
- **Stop rules for a chain of runs**, where one run's end starts the next (implement, review, rework). A run never
  waits for a person: it ends, and the person's later change starts the next run. Every loop of runs has a cap,
  counted where a stateless run can read it, such as a label on the pull request. A run that fixes a failed run
  starts nothing when it fails itself, so fixes never chain. A new automated trigger starts throttled, such as one
  bug report in ten or once a day, with a person's review on every pull request.
- **A check on the workflows.** A required CI job reads the agent workflows and fails on a job with no time limit, no
  concurrency group on the item, no step that blocks with the reason, an in-progress removal that does not always
  run, a hand-off with the built-in token (as a fallback too), a retry around the agent's call, or a loop of runs
  with no cap. Code owners review the workflows.

## Where it does not apply

A run a person watches has someone to read its end. This loop says whether a run left work to hand on, never whether
the work is right: the checks and the review on the pull request decide that.
