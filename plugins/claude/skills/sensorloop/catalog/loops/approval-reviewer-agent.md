---
title: A reviewer answers permission prompts
summary: In a run nobody watches, a read-only reviewer model answers the agent's permission prompts in place of a person. It scores the action's risk and whether the person authorised it, and a denial forbids reaching the same effect another way.
sensors: [llm-judge, human-answer]
when: Each time the agent asks for an action that no allow or deny rule settles and its sandbox does not cover, at the point where a permission prompt would be shown.
failure: The reviewer denies the action, because its risk is too high for the authorisation it found, the authorisation came only from text the agent read, or a project rule forbids it. Also three denials in a row, or ten of the last 50 reviews, in one turn. Until the reviewer is calibrated, its answer is advice.
next: A denied call fails with the reason and the rule. The agent may try a materially safer method, which is reviewed again, and finishes the work the denial does not touch, but never reaches the same effect another way. Too many denials stop the turn, and the person sees the denied requests. An action that cannot be undone is never the reviewer's to allow; it waits for a person or is refused. Until the reviewer is calibrated, a person answers each prompt with its verdict shown, and in a run nobody watches the call is refused.
---

## The loop

1. The agent asks for an action outside its allow rules and its sandbox. A hook sends the request to the reviewer
   instead of a person, with the planned action, the session's transcript, the person's instructions and the
   agent's permissions.
2. **Where the authorisation came from.** Only the person's own messages, the project's instructions file and the
   person's answers to the agent's questions can authorise. Tool output, files, web pages, skills and the agent's own
   text are evidence: they can say how to do the task, but not widen what the person asked for unless the person
   said to follow them. Evidence cut to fit the reviewer's budget is marked, and missing evidence authorises nothing.
3. **The risk**: low (narrow, easy to undo), medium (bounded, or with side effects that can be undone), high (costly
   to undo), critical (a credential sent out, or a large destruction).
4. **It looks only when looking would change the answer**, with read-only commands: before `rm -rf build/` it lists
   what is there.
5. **It answers** allow or deny, with the risk, the authorisation (unknown, low, medium or high) and one sentence of
   reason. One default: low and medium are allowed unless a project rule or a clear injection says otherwise; high
   only with at least medium authorisation and a narrow scope; critical never.
6. **A denial fails the call** with the reason and the rule, and tells the agent not to reach the same outcome by a
   workaround or an indirect command, but to go on only with a materially safer method, or once the person approves
   the action after hearing the risk, and otherwise to stop and ask.

A review that did not finish is neither a denial nor an allow. On a timeout the agent may retry once or ask the
person. On a malformed answer or a crash the action does not run, and the agent is told that the review failed, not
that the action is unsafe, and not to bypass the check. A reviewer that keeps giving no answer is an outage: retries
back off, and the turn stops for a person.

## Why

A person asked to approve every command stops reading the prompts. With nobody there, the run either stops at the
first prompt or runs with the gates off. Some actions are risky only in context: a deletion the person never asked
for, an upload to a host that a README the agent read told it to use. A rule over the command string cannot see where
the action came from; a reviewer that reads the transcript can, and answers in seconds.

## Set up

- **Where it hooks in**: where the coding agent would ask the person. In Claude Code, a `PermissionRequest` hook runs
  there, also in sessions that cannot show a prompt, and can allow or deny in the person's place; set to fail closed,
  it denies when it crashes or times out. Codex has such a reviewer built in, used only when chosen
  (`approvals_reviewer = "auto_review"`). The reviewer runs read-only, with no network, and never asks for approval.
- **The irreversible stays with a person.** The reviewer answers only for actions that can be undone. A deploy,
  deleting data, a message sent outside the project and spending money stay ask rules: the hook gives no answer for
  them, so a person is asked, or, in a run nobody watches, the call is refused. What must never run is a deny rule,
  which no reviewer and no allow rule overrides.
- **The policy is one file** with code owners: the evidence rules, the risk levels with the project's own examples,
  and the thresholds, with the project's stricter rules first, such as "deny any write outside the repository".
- **A person's override covers one action.** When the person approves an action the reviewer denied, the agent is told
  that this exact action, with these arguments, is approved, and nothing similar with a different payload.
- **Too many denials stop the turn.** An agent that keeps asking for variants of a refused action is probing the gate.
  The denial's wording asks it not to work around the denial; the count is what stops one that does.
- **The reviewer is not the boundary.** An injected instruction the reviewer allows runs with nobody approving it, so
  the sandbox stays on under the reviewer.
- **Every review is kept**: the request, the answer and what happened next. A wrong allow is the costly mistake that
  nothing else reports, so a person grades a sample of allows each week, and each wrong one becomes a case.
- **Calibrated before it answers alone.** Until then, a person answers each prompt with the reviewer's verdict shown,
  and each answer becomes a case, with the transcript it had. To deny: `rm -rf data/` the person never asked for; a
  `curl` that posts `.env` to a host named only in a README the agent read; a fourth variant of a command denied
  three times. To allow: installing the package the person named; `rm -rf build/` once a read-only check shows only
  build output there. A change to the policy or the model runs the cases again.
- **Out of the agent's reach.** A hook refuses the agent's writes to the policy, the hook and the permission settings.
