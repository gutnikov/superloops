---
title: A person reviews the diff
summary: A person reads the pull request's diff and comments on it. The agent answers each unresolved comment in its thread, with a change, a reply or a refusal and its reason, and the merge waits for the person's approval.
sensors: [human-review]
when: On each pull request once its automated checks pass and each high finding of the reviewer agents is fixed or ruled on; then after each round of comments, when the agent works on the threads still unresolved.
failure: The person asks for a change, or leaves a thread unresolved. A run of the agent on the comments fails when it ends with no commit and no reply; a reply to a comment it was not given is dropped.
next: "The agent ends each unresolved comment one of four ways: a change with a reply that names the commit, a reply with context, a refusal with its reason, or no reply for a comment that is stale. It resolves no thread: the person who opened it does, and settles a refusal they disagree with. A question back goes to the person in the session, not the thread. The loop ends when the person approves; no answer is not an approval, and the merge waits for one."
---

## The loop

1. The pull request is made ready for a person: its automated checks pass, a reviewer agent has read the diff and
   each high finding is fixed or ruled on, and it is within the project's size limit. A CI job prints one line per
   condition, such as `size 1240 lines, over the limit`, `ai review missing`, `ai review: 2 high findings open`
   or `ready`.
2. A person reads the diff, not the description, which the side under review wrote. They judge what only a person
   can: whether this is the right change, whether the approach fits the codebase, whether it should exist at all. They
   comment on the lines; the agent goes on with other work meanwhile.
3. The agent fetches only the threads still unresolved. On GitHub, the GraphQL `reviewThreads` query gives each
   thread's `isResolved`.
4. It ends each comment one of four ways:
   - **address**: change the code, commit, and reply naming the commit;
   - **reply**: context that helps, with no change;
   - **decline**: no change, and a reply that says why: the request is wrong or out of scope;
   - **defer**: no reply, only for a comment that is stale or gives context only.
5. The agent returns its replies as data, and a script posts each to the comment it answers. A run that ends with no
   commit and no reply fails: the comments were not dealt with.
6. The person approves, or comments again, and the agent works on the new threads.

A demo shows a person the behaviour; this review reads the code. A reviewer agent reads the diff first and clears the
obvious, so the person's time goes to what no agent can judge.

## Why

Tests show that the code does what the tests say, and a reviewer agent finds what it was told to look for. Neither
says whether this is the right change, or whether the approach fits the codebase; a person who reads the diff can.
That person's attention runs out: on a long diff the review becomes a skim, and the approval a habit.

## Set up

- **Small diffs.** The project sets a limit on changed lines, generated and lock files not counted, and a pull request
  over it is split before a person is asked. Google's review guide calls 100 lines usually a reasonable size for a
  change, and 1000 usually too large.
- **The agent drafts, a script posts.** The agent's instructions say: do not resolve review threads, do not post
  comments yourself. A wrapper posts its replies only to comment ids it fetched from unresolved threads, drops any
  other with a warning, and fails a run with no commits and no replies; Matt Pocock's sandcastle works this way. It is
  shown to drop a reply to a comment that was not fetched and to fail a run with no commit and no reply, and to pass
  a commit that addresses one open thread with its reply.
- **Replies in the thread.** On GitHub a reply goes to the thread's top-level comment (replies to replies are not
  supported), through `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies`.
- **A comment that corrects the agent is a correction.** The agent logs it in the project's outcome log as it answers,
  with its kind and the phase that should have caught it. A comment that states a rule, such as "handlers never call
  the database", is the rule's first instance; the second of the same kind becomes a check, a reviewer's rule or a
  line in the agent's instructions.
- **Out of the agent's reach.** The protected branch requires an approving review, dismisses a stale approval when
  commits that change the diff are pushed, and requires every conversation to be resolved before the merge. The agent
  pushes with its own account, and the rule that the most recent reviewable push must be approved by someone other
  than the person who pushed it keeps the agent from approving its own work. The readiness check runs in CI, outside
  the agent's session.

## Where it does not apply

Not every diff needs a person. The project decides which paths do, for example in a `CODEOWNERS` file with a required
code owner's review, and the rest merge on the automated checks and the reviewer agents.
