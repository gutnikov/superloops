---
title: Merge parallel agents' branches one at a time
summary: Agents that work in parallel each leave a branch. A wrapper asks git which branches are ready, merges them into the target one at a time with the type check and the tests after each, and fails a merge that moved nothing or left conflicts.
sensors: [repository-state, build-and-types, test-runner]
when: After each cycle of parallel runs and before the next is planned, once for every branch git shows ahead of the target; and when the base moves under an open pull request.
failure: A branch ahead of the target that is not merged and green at the end of the cycle. A merge the agent made that left HEAD where it was, left a file unmerged, or staged a file with conflict markers in it. A type check or a test that fails after a merge. Two branches of one cycle that changed the same file, even when they merge clean and pass.
next: The merger agent resolves each conflict and fixes what is red before it takes the next branch, and the wrapper runs the checks again before it accepts the merge. A branch still red at the merger's turn limit is reset out of the target and its item blocked with the failing check; the branches after it go on. A file two branches both changed goes to a person, who reads its diff before the next cycle. The person also gets the merger's comment on each conflict it resolved.
---

## The loop

1. A planner reads the open items and holds B back when it needs code that A adds, when A and B change the same
   files or modules, or when B waits on a decision A makes. Only unblocked items run in parallel; when all are
   blocked, the one with the fewest dependencies runs alone. Each item's branch is named from its id alone, so
   planning the item again reuses its branch and the commits on it.
2. After the runs, git says which branches to merge: a branch is merged when `git rev-list --count HEAD..<branch>` is
   above zero, whichever cycle made its commits. A run's own list of commits would strand a branch that an earlier
   cycle advanced and never merged. A run that crashed is logged, and its branch waits. An item is done when its
   branch is merged, not when the tracker says so.
3. One branch at a time, the merger agent runs `git merge <branch> --no-edit`, resolves any conflict, runs the type
   check and the tests, and fixes them before it takes the next branch.
4. After each merge, the wrapper checks the result, not the agent's account of it:
   - HEAD moved;
   - no file is unmerged (`git diff --name-only --diff-filter=U`);
   - no file the merge changed has a line that starts with `<<<<<<< ` or `>>>>>>> `: a file staged with its markers
     still in it is not on the unmerged list;
   - the type check and the tests pass, run by the wrapper itself.
5. A branch still red at the merger's turn limit is reset out (`git reset --hard <the commit before the merge>`) and
   its item blocked with the failing check. The branches after it go on.
6. The wrapper lists each file that two branches of the cycle both changed. Two branches can each add the same text
   to a shared catalogue under different names: they merge clean and pass, and only a person reading the diff sees
   it.

## Why

Agents in parallel each work on a branch of their own, and each branch passes its checks alone. Put together, the
branches conflict, or they merge without a conflict and break: one renames a function the other calls. Separate
worktrees do not remove collisions; they postpone them to merge time. An agent that resolves a conflict can drop one
side's intent, commit nothing or leave the merge half done, and a wrapper that takes its word ships that or strands
the branch. Checks after every merge, not only after a conflict, name the branch that broke the build.

## Set up

- **A cap on parallel runs**: start at four, for example, and raise it while the merges stay green.
- **Shared files get an edge.** When two items touch one shared file, such as a message catalogue, a config registry
  or a shared type, the plan runs them one after the other, or the notes both agents read fix the exact names each
  adds.
- **One writer per worktree.** A run takes a lock outside the worktree, where the agent cannot delete or commit it,
  created atomically and holding its process id. A lock that a live process holds fails the second run at once; a
  dead process's lock is removed. Nothing waits.
- **The merger only merges.** It does not push, close items or abort a merge. The wrapper pushes with a lease on the
  commit it started from, and closes the items whose branches `git branch --merged` lists.
- **A failed merge leaves the target as it was.** A merge the wrapper makes and cannot finish is aborted when one is
  in progress (`MERGE_HEAD` exists), and the message names the kept branch and the retry: `git merge <branch>`,
  resolve the conflicts and commit.
- **When the base moves under an open pull request, plain git goes first.** A branch that already holds the base's
  head is left alone, and a merge of the base with no conflict is pushed with no agent. Only a conflict calls the
  agent, with three rules: resolve, never abort; read how each side got there (`git log -p --follow -- <path>`);
  invent no new behaviour, and flag the doubt instead.
- **The merger's comment** names each conflict, how it was resolved and any doubt, written so the person can spot a
  bad call in 30 seconds. It informs; the wrapper's checks decide.
- **Merge the target in early.** An agent that merges the target's tip into its own branch before it reports done
  meets its conflicts while its context is warm. The merges here still run after it.
- **The last check is out of the agents' reach**: CI on the target branch and, where the code host has a merge queue,
  on each queued change together with those ahead of it (`merge_group` in GitHub Actions).

## Where it does not apply

One agent on one branch has nothing to integrate: the checks on its pull request are enough.
