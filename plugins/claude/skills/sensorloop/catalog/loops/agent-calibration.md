---
title: Calibrate before it blocks
summary: An expert grades a sample of results pass or fail, each with a critique, and the grades become the cases a judge or reviewer agent is scored against. The agent may block only once it agrees with them at a rate a person approved.
sensors: [human-review, eval-set]
when: When a loop's judge, reviewer or refuter is written; again whenever its prompt, its model or the agent that writes its prompt changes, before it blocks again; and on a schedule, when the expert grades a fresh sample of its verdicts in real use.
failure: Over at least three runs, the agent catches fewer of the expert's fails, or lets through fewer of the expert's passes, than the threshold a person approved, each measured apart. Also an agent that blocks with no score, or with a prompt or model newer than its score, and each verdict in real use that a person overrules or a later check proves wrong.
next: Whoever looks after the loops revises the agent's prompt from the cases it got wrong and scores it again; the expert only grades. Until it reaches the threshold, and whenever it falls below it, its verdicts are advice and block nothing. Each wrong verdict in real use becomes a new case. After three revisions below the threshold, the person who set the threshold gets the cases it still gets wrong, with its scores, and decides whether to split it into narrower agents, one per criterion, or keep it as advice.
---

## The loop

1. One expert, the person whose judgement the agent stands in for, grades a sample of real results. For each, they
   answer pass or fail to one question, "did it achieve what was wanted?", and write a critique that says why,
   detailed enough for a new colleague to follow. No scale from 1 to 5: nobody can say what makes a 3 a 4.
2. Each graded result becomes an eval case: the input the agent will see, the expected verdict and the critique. A
   few critiques go into the agent's prompt as examples; their cases do not count toward its score.
3. The agent runs on every case at least three times, with its real prompt, on the model it uses in real work, and
   behind the agent that writes its prompt, when one does. A run that errored is missing, not a wrong verdict.
4. A script scores it per case and overall: the share of the expert's fails it also fails, and the share of the
   expert's passes it also passes, each apart. Raw agreement hides a judge that always says pass: with 5% failures it
   agrees 95% of the time and catches nothing. A case it gets right in some runs and wrong in others is flaky.
5. Below the threshold, the prompt is revised from the cases it got wrong, and the agent is scored again. At or above
   it, the agent may block, and the score is recorded with the prompt and the model it was measured on.
6. In real use, each verdict's outcome is logged: confirmed, overruled by a person, or missed, when a later check or a
   person finds what it passed. Each false alarm and each miss becomes a case. On a schedule, the expert grades a
   fresh random sample of its verdicts, passes as well as fails, and each disagreement becomes a case.
7. A new prompt, model or prompt-writing agent sends it back to step 3 before it blocks again.

A reviewer whose right answer a script can check, such as a planted defect it must find, needs no expert: its cases
are broken and clean copies of real work. A judge of quality or taste needs the expert's grades.

## Why

A model's verdict varies from run to run, and how often it is right is unknown until it is scored against known
answers. A verdict that blocks without that score is a guess presented as a check, and the working agent learns to
satisfy the reviewer instead of the requirement. An expert cannot grade every result, but can grade a sample once.
Scored against it, the agent is right at a known rate; until this loop passes it, every loop that reads the agent
treats its verdict as advice.

## Set up

- **One expert, not a stand-in.** Grades from several people contradict each other, and a developer or a manager
  grading in the expert's place calibrates the agent to the wrong judgement.
- **The sample** comes from real use and covers the kinds of input the agent will see, with enough passes and fails
  to measure both. About 30 results show the ways the work fails and shape the rubric. To trust a score, aim for
  about 100 graded results per kind of failure; below 60, the score is too uncertain to rely on.
- **Cases that tempt it.** A reviewer's cases include a defect the plan asks for, such as a test with no assertion
  because the plan says so: a weak reviewer does not only miss it, it argues that the defect follows the plan.
- **Cases from history**, where a person already gave the answer: a closed issue and the pull request a person merged
  for it, run on the code at the issue's version, with the expected answer cut to what the issue needed.
- **The evidence as well as the verdict.** A case can require what a verdict rests on, such as an audit that counts
  only if the agent read the page and the code it describes; a right verdict reached without reading is not
  agreement. An agent that acts, such as one that closes issues, is also scored apart on the real issues it keeps
  open: a real bug closed costs more than spam left open.
- **The agent that writes its prompt is part of what is scored.** In one project's runs, the same reviewers caught a
  planted defect in 5 of 5 runs under a coordinator on the strongest model, and let it ship in 4 of 5 under a cheaper
  one. Cases that decide a change of model run five times, not three.
- **The threshold** is set by a person before the runs it judges, such as 5 of 5 per case or a rate overall, and kept
  with the cases. A threshold written after its results does not count.
- **Out of the agent's reach.** A registry lists each agent with its prompt, model, threshold and last score. A CI
  check fails when an agent blocks below its threshold, or with a prompt or model newer than its score. The cases and
  thresholds have code owners, and a hook refuses the working agent's writes to them.

## Where it does not apply

A test or a linter gives the same answer every time and needs no calibration. Where no person can say what the right
answer is, there is nothing to calibrate against, and the model's verdict stays advice.
