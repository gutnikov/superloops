# Metamodel

Stop instructing the agent: give it a feedback loop. An agent makes a change, a check reads it, and the agent fixes what the check found. We treat these loops as first-class parts of a project: named, kept beside the code, measured, and improved when they let a problem through.

<!-- figure -->

We call such a loop a validation loop: it judges the quality of a change by reading a sensor, and improves the change when the sensor spots a problem. Some loops are short and fast, like running unit tests on a change. Others take longer, like running end-to-end tests. Some run while the work is being done, before anything is pushed to git. Others run later: in CI, on staging, or even after the code has reached real users, like scanning production logs.

A successful AI-first development process is built around designing the right loops: loops that do the checking for you. The right set of loops is different for every project and depends on its needs and constraints. It is always a trade-off. A loop costs time, money and attention, so it pays off only where the failure it catches is likely or expensive.

## Sensor

A sensor is anything that observes a change, or the system the change lives in, and reports a signal about its quality: pass or fail, a score, or a list of findings. A sensor only observes. It never changes the work.

Sensors come in three kinds:

- **Computational**: a program that gives the same answer every time. It is cheap and fast, but it sees only what it was written to see.
- **Inferential**: a model reads the work and judges it. It can see what no fixed rule can express, but it costs money, it can be wrong, and it has to be calibrated before it is trusted.
- **Human**: a person looks at the result or answers a question. This is the slowest and most expensive kind, and the final judge of whether the result is what was wanted.

Examples:

- A test runner: the tests pass or fail on the changed code.
- A linter whose message says how to fix the problem.
- An LLM reviewer that reads the diff with a fresh context and lists what it finds.
- A service's error rate after a release, compared with the rate before it.

## Tool

A tool is what a sensor is built with. The sensor is what is measured; the tool is how. One sensor can be built with different tools, and one tool can serve several sensors. Choosing the sensors is a design decision; finding the tools is not.

A tool is described by the role it plays, so that its description holds in any project, whatever its stack. When the program behind the role depends on the stack, it is found in the project itself (its CI, its task file, its README) and never assumed. The products that can play the role are the tool's vendors, listed on its card.

Examples:

- The project's test command builds the test-runner sensor. It is pytest in one project, Jest in another and go test in a third; the role, and how to find it, stay the same.
- A browser driver such as Playwright serves two sensors: it drives a browser through a user flow, and it takes screenshots of the result.
- The project's log store, such as Loki, answers the queries of the logs sensor, and its error tracker, such as Sentry, reports the errors users actually hit.

## Loop

A loop connects a sensor to the work. It defines three things:

- **When** the sensor is read: on every edit, before the agent stops, on every pull request, every night, or after a release.
- **What** counts as a failure.
- **What happens next**: who fixes the work, and when to stop and escalate to a person.

The loop repeats until the sensor passes, or until it gives up and asks for help. Where a loop sits in the change path decides how early a problem is caught and how much it costs to fix.

Examples:

- **Green before stop** (local): the agent can't end its turn while the tests or the linter fail. It reads the failure, fixes the code, and runs them again.
- **Pull request review** (before merge): an LLM reviewer reads the diff. A blocking finding sends the change back to the agent, and a person settles any dispute.
- **Production log scan** (after release): after a deploy, the error signatures in the logs are compared with those from before it. A new signature opens an issue or triggers a rollback.

## Metaloop

The loops themselves are improved in a loop:

1. Do the task.
2. Notice which sensors or loops should have caught a problem (or caught it earlier), and improve them.
3. Repeat.

For example, a reviewer finds the same mistake in a third pull request. Instead of fixing it a third time, add a lint rule or a test that catches it before review, at the earliest phase that can see it.
