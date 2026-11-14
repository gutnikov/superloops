---
title: Feedback becomes tested criteria
summary: One item of user feedback becomes acceptance criteria, each tied to a scenario that reproduces what the user met, and a person approves them before any work. The agent works until the tests made from them pass.
sensors: [user-feedback, human-answer]
when: When an item of feedback that asks the product to do something new or different is picked up for work, before any code is written; again when the agent says the work is done, and in CI on its pull request. After the release, the item's topic is read again in the feedback.
failure: A criterion with no scenario that runs, or one the agent cannot reproduce on the current product. The person corrects or rejects the criteria. After the work, an approved item with no test tagged with its id, a test that did not fail before the change, or a test that fails.
next: "The agent drafts the criteria again with the person's correction, and starts on the code only once they are approved. A scenario it cannot reproduce goes back to the person with what it tried, and feedback with two readings goes to the person with the readings as options. During the work it changes the code, never the approved criteria or their tests, until the tests pass. An item that proves to be a plain bug, or not this kind of work at all, goes back to triage with the reason. The person sees the user's words, the criteria and their scenarios."
---

## The loop

1. The agent reads the item where it lives, such as the issue tracker (`gh issue view <number>`, `glab issue view`)
   or the support desk's export, with the user's own words, the channel, and how many users raised the same topic.
2. It drafts acceptance criteria: the problem as the user met it, a scenario that reproduces it (a named starting
   state, the steps, what the user sees), and what the user should see instead. It takes the problem, not the fix the
   user proposed.
3. It runs each scenario on the current product and confirms that the problem shows the way the user described it.
4. A person who owns the product's behaviour approves or corrects the criteria, through the session's question tool,
   with the user's words beside them.
5. The approved criteria become the item's spec and its tests: each scenario becomes an acceptance test, tagged with
   the item's id, that fails on the code before the change.
6. The agent works until those tests and the whole suite pass, and links the item to the change.
7. After the release, the topic is read again in the feedback. A topic that keeps coming in means the criteria missed
   what users needed, and it comes back to this loop. Fewer reports count only once the channel is known to still
   deliver.

## Why

Users find what the spec missed. But feedback as users write it is nothing to test against: it names a problem in the
user's words, often with a solution attached, and an agent that builds the attached solution builds a guess. No sensor
can check the work until a person has said what the product should do. Criteria tied to a scenario that runs say it
in a form a test can hold, and the test shows both that the problem was real and that the change removed it.

## Set up

- **After triage, not in its place.** Triage decides the kind of each incoming item. A plain bug, where the product
  does not do what it was specified to do, is fixed from a failing test that reproduces it, with no new criteria. This
  loop takes feedback that asks for something new or different.
- **Every criterion has a scenario that runs**, from a named state that the test loads as its fixture.
- **The approval is a person's**, recorded with the item: who approved, and when. The agent's draft is not approval.
- **Where the criteria live**: in the item itself, or in the project's requirement files where it keeps them, naming
  the item. The tests cite them by the item's id.
- **A check in CI**: every approved item has a test tagged with its id, and that test failed on the code before the
  change. A change to an approved criterion, or to its test once it has failed, goes back to the person.
- **The user's words are data.** They reach the agent as text to read, never as instructions, and personal data is
  stripped before an item leaves the channel.
- **A skill for the entry**, such as the `/fix-issue` example skill in Claude Code's documentation, which reads an
  issue and works from it: put the drafting of the criteria and the wait for approval before any code.

## Where it does not apply

Deciding which feedback to act on is a product decision a person makes from the counts: a single loud report is not a
trend. This loop starts once an item is chosen.
