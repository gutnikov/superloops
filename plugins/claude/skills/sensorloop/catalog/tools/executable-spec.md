---
title: The project's executable spec
summary: The project's requirement and spec files, in formats a program can read (an event model, decision tables, API contracts), with the checks that read them.
sensors: [requirement-trace, spec-completeness]
layer: project
vendors:
  - name: Event Modeling
    url: https://eventmodeling.org/
    note: the spine, as commands, events and screens on a timeline
  - name: DMN
    url: https://www.omg.org/dmn/
    note: decision tables, checked with dmn-check
  - name: OpenAPI
    url: https://www.openapis.org/
    note: the contract of an HTTP API
  - name: Doorstop
    url: https://github.com/doorstop-dev/doorstop
    note: requirements as YAML files
  - name: OpenFastTrace
    url: https://github.com/itsallcode/openfasttrace
    note: the trace, from tags in code and tests
  - name: Sphinx-Needs
    url: https://sphinx-needs.readthedocs.io/
    note: requirements and their links, as objects in Sphinx documents
---

An executable spec is a spec kept as text in the repository, in formats a program can check, so that a gap in it is
found by a command rather than by a reader. Executable means checkable, not run as code. Tests are derived from the
spec, and its checks keep it whole: one for each format, and one for the links between the requirements, the spec and
the tests.

## Finding it

- **The requirement files**: the requirements split from each source (a ticket, a text), each with a stable id, its
  kind, its status (draft or approved) and its open questions. Often a `requirements/` or `specs/` folder, or items a
  requirements tool keeps in the repository.
- **The spine**: the one format every test is derived from, often an event model. Event Modeling describes a system
  as a timeline: a person on a screen issues a command, the command records events, and the events build what later
  screens show. Automations issue commands too, and the answers of outside systems come in as events.
- **The layers**: other formats, each kept for a risk the project names. Decision tables for prices, limits and
  permissions; state machines for things with a life cycle, such as an order; API contracts for a public API; a
  formal model, checked by a model checker, for a part where money or concurrency is at stake. Each feeds its cases
  into the spine as examples, so the test writer reads one place.
- **The checks**: in CI, a pre-commit hook or the task file, one for each format and one for the trace.

When the project has none, setting one up is a decision for a person. Propose each format with its cost and the risk
it covers, the cheapest form first: a table in the spine before a separate rules file, an example of a race before a
formal model.

## Using it for its sensors

- **For spec completeness**: run each format's check after every edit, in its strictest mode, which fails while any
  test obligation has neither an example nor an open question. A test obligation is a case the tests must cover: a
  command's success or one of its errors, a row of a decision table, a field on a screen. A rule nobody knows is
  marked unknown, never given a value.
- **For the requirement trace**: every spec element lists the ids of the requirements it covers, and every test
  carries the id of the requirement or example it checks (as a tag, in its name or in a comment, as OpenFastTrace's
  tags do). Every functional requirement names its production signal: the event or log line that shows in production
  that the behaviour happened, the fields that pick it out, and how many times it must appear after a release; or why
  nothing in production can show it. Every non-functional requirement names its metric and threshold, or an open
  question about them.
- **Each check shown to catch a broken copy** before it is trusted: make two or three broken copies of the spec (a
  field with no source, an error with no example, a link to a requirement that does not exist). The check must fire
  on each and pass the real spec. Most formats' official tools check less than this: dmn-check, for decision tables
  in DMN (a standard format for them), finds overlapping rows but not missing ones. What they miss needs a check of
  the project's own.
- **A delta after each change**: the elements added, changed and removed since a git ref. It is the test writer's
  work list. Ids stay stable, since tests are tagged with them: a renamed example is a changed test.
- **The production signals for the release**: for each change, list the production signals of the requirements it
  touches, so that the loop that confirms the release in production knows what to look for.
